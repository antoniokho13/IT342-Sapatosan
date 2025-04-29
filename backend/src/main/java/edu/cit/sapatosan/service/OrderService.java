package edu.cit.sapatosan.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.entity.OrderProductEntity;
import edu.cit.sapatosan.entity.PaymentEntity;
import edu.cit.sapatosan.entity.ProductEntity;

@Service
public class OrderService {
    private final DatabaseReference orderRef;
    private final DatabaseReference productRef;
    private final DatabaseReference orderProductRef;
    private final CartService cartService;
    private final ProductService productService;
    private final PaymentService paymentService;

    public OrderService(CartService cartService, ProductService productService, PaymentService paymentService) {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.orderRef = database.getReference("orders");
        this.productRef = database.getReference("products");
        this.orderProductRef = database.getReference("orderProducts");
        this.cartService = cartService;
        this.productService = productService;
        this.paymentService = paymentService;
    }

    public String createOrderFromCart(String userId, OrderEntity orderDetails) throws ExecutionException, InterruptedException {
        // Retrieve the user's cart
        Optional<CartEntity> cartOptional = cartService.getCartByUserId(userId).get();
        if (cartOptional.isEmpty()) {
            throw new IllegalArgumentException("Cart not found for user");
        }

        CartEntity cart = cartOptional.get();
        if (cart.getCartProductIds() == null || cart.getCartProductIds().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Calculate total amount and prepare order products
        double totalAmount = 0.0;
        List<String> orderProductIds = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : cart.getCartProductIds().entrySet()) {
            String productId = entry.getKey();
            int quantity = entry.getValue();

            Optional<ProductEntity> productOptional = productService.getProductById(productId).get();
            if (productOptional.isEmpty()) {
                throw new IllegalArgumentException("Product not found: " + productId);
            }

            ProductEntity product = productOptional.get();
            totalAmount += product.getPrice() * quantity;

            OrderProductEntity orderProduct = new OrderProductEntity();
            orderProduct.setProductId(productId);
            orderProduct.setQuantity(quantity);
            orderProduct.setPrice(product.getPrice());
            String orderProductId = orderProductRef.push().getKey();
            if (orderProductId != null) {
                orderProduct.setId(orderProductId);
                orderProductRef.child(orderProductId).setValueAsync(orderProduct);
                orderProductIds.add(orderProductId);

                reduceProductStock(productId, quantity);
            }
        }

        // Create the order
        OrderEntity order = new OrderEntity();
        order.setUserId(userId);
        order.setOrderDate(new Date());
        order.setTotalAmount(totalAmount);
        order.setStatus("ACTIVE");
        order.setOrderProductIds(orderProductIds);

        // Fill in additional details from the request body
        order.setFirstName(orderDetails.getFirstName());
        order.setLastName(orderDetails.getLastName());
        order.setEmail(orderDetails.getEmail());
        order.setAddress(orderDetails.getAddress());
        order.setPostalCode(orderDetails.getPostalCode());
        order.setCountry(orderDetails.getCountry());
        order.setContactNumber(orderDetails.getContactNumber());

        // Save the order to Firebase
        String orderId = orderRef.push().getKey();
        if (orderId != null) {
            order.setId(orderId);
            orderRef.child(orderId).setValueAsync(order);
        }

        // Create the payment
        PaymentEntity payment = new PaymentEntity();
        payment.setAmount(totalAmount);
        payment.setDescription("Payment for order " + orderId);
        paymentService.createPayment(orderId, payment);

        // Clear the cart
        cartService.deleteCart(cart.getId());

        return orderId;
    }

    public void cancelOrder(String orderId) {
        orderRef.child(orderId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                OrderEntity order = snapshot.getValue(OrderEntity.class);
                if (order != null && order.getOrderProductIds() != null) {
                    for (String orderProductId : order.getOrderProductIds()) {
                        incrementProductStock(orderProductId);
                    }
                    // Delete the order after restoring stock
                    orderRef.child(orderId).removeValueAsync();
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to fetch order: " + error.getMessage());
            }
        });
    }

    private void reduceProductStock(String productId, int quantity) {
        productRef.child(productId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                ProductEntity product = snapshot.getValue(ProductEntity.class);
                if (product != null) {
                    int newStock = product.getStock() - quantity;
                    product.setStock(newStock);
                    productRef.child(productId).setValueAsync(product);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to update product stock: " + error.getMessage());
            }
        });
    }

    private void incrementProductStock(String orderProductId) {
        orderProductRef.child(orderProductId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                OrderProductEntity orderProduct = snapshot.getValue(OrderProductEntity.class);
                if (orderProduct != null) {
                    String productId = orderProduct.getProductId();
                    int quantity = orderProduct.getQuantity();

                    productRef.child(productId).addListenerForSingleValueEvent(new ValueEventListener() {
                        @Override
                        public void onDataChange(DataSnapshot productSnapshot) {
                            ProductEntity product = productSnapshot.getValue(ProductEntity.class);
                            if (product != null) {
                                int newStock = product.getStock() + quantity;
                                product.setStock(newStock);
                                productRef.child(productId).setValueAsync(product);
                            }
                        }

                        @Override
                        public void onCancelled(DatabaseError error) {
                            System.err.println("Failed to update product stock: " + error.getMessage());
                        }
                    });
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to fetch order product: " + error.getMessage());
            }
        });
    }

    public void updatePaymentStatus(String orderId, OrderEntity.PaymentStatus paymentStatus) {
        orderRef.child(orderId).child("paymentStatus").setValueAsync(paymentStatus);
    }

    public List<OrderEntity> getAllOrders() {
        CompletableFuture<List<OrderEntity>> future = new CompletableFuture<>();
        List<OrderEntity> orders = new ArrayList<>();

        orderRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    OrderEntity order = snapshot.getValue(OrderEntity.class);
                    if (order != null) {
                        orders.add(order);
                    }
                }
                future.complete(orders);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                System.err.println("Failed to fetch orders: " + databaseError.getMessage());
                future.completeExceptionally(databaseError.toException());
            }
        });

        try {
            return future.get();
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Failed to fetch orders: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}
