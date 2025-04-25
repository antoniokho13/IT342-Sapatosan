package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.entity.OrderProductEntity;
import edu.cit.sapatosan.entity.PaymentEntity;
import edu.cit.sapatosan.entity.ProductEntity;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class PaymentService {
    private final DatabaseReference paymentRef;
    private final DatabaseReference orderRef;
    private final DatabaseReference productRef;

    public PaymentService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.paymentRef = database.getReference("payments");
        this.orderRef = database.getReference("orders");
        this.productRef = database.getReference("products");
    }

    public void createPayment(String orderId, PaymentEntity payment) {
        // Save the payment to Firebase
        String paymentId = paymentRef.push().getKey();
        if (paymentId != null) {
            payment.setId(paymentId);
            payment.setOrderId(orderId);
            paymentRef.child(paymentId).setValueAsync(payment);

            // Reduce stock for each product in the order
            orderRef.child(orderId).addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    OrderEntity order = snapshot.getValue(OrderEntity.class);
                    if (order != null && order.getOrderProductIds() != null) {
                        for (String orderProductId : order.getOrderProductIds()) {
                            reduceProductStock(orderProductId);
                        }
                    }
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    System.err.println("Failed to fetch order: " + error.getMessage());
                }
            });
        }
    }

    private void reduceProductStock(String orderProductId) {
        DatabaseReference orderProductRef = FirebaseDatabase.getInstance().getReference("orderProducts").child(orderProductId);
        orderProductRef.addListenerForSingleValueEvent(new ValueEventListener() {
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
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to fetch order product: " + error.getMessage());
            }
        });
    }
}