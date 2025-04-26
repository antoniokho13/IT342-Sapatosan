package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.entity.OrderProductEntity;
import edu.cit.sapatosan.entity.ProductEntity;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final DatabaseReference orderRef;
    private final DatabaseReference productRef;
    private final DatabaseReference orderProductRef;

    public OrderService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.orderRef = database.getReference("orders");
        this.productRef = database.getReference("products");
        this.orderProductRef = database.getReference("orderProducts");
    }

    public void createOrder(OrderEntity order) {
        String orderId = orderRef.push().getKey();
        if (orderId != null) {
            order.setId(orderId);
            orderRef.child(orderId).setValueAsync(order);
        }
    }

    public void updateOrder(String orderId, OrderEntity updatedOrder) {
        orderRef.child(orderId).setValueAsync(updatedOrder);
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

    public void associatePaymentWithOrder(String orderId, String paymentId) {
        orderRef.child(orderId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                OrderEntity order = snapshot.getValue(OrderEntity.class);
                if (order != null) {
                    order.setPaymentId(paymentId);
                    order.setPaymentStatus(OrderEntity.PaymentStatus.PAID);
                    orderRef.child(orderId).setValueAsync(order);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to associate payment with order: " + error.getMessage());
            }
        });
    }

    public void updateOrderStatus(String orderId, String status) {
        orderRef.child(orderId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                OrderEntity order = snapshot.getValue(OrderEntity.class);
                if (order != null) {
                    order.setStatus(status);
                    orderRef.child(orderId).setValueAsync(order);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to update order status: " + error.getMessage());
            }
        });
    }
}