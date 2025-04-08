package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.entity.OrderProductEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class OrderService {
    private final DatabaseReference orderRef;
    private final DatabaseReference orderProductRef;

    public OrderService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.orderRef = database.getReference("orders");
        this.orderProductRef = database.getReference("orderProducts");
    }

    public CompletableFuture<List<OrderEntity>> getAllOrders() {
        CompletableFuture<List<OrderEntity>> future = new CompletableFuture<>();
        orderRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<OrderEntity> orders = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    OrderEntity order = child.getValue(OrderEntity.class);
                    orders.add(order);
                }
                future.complete(orders);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public CompletableFuture<Optional<OrderEntity>> getOrderById(String id) {
        CompletableFuture<Optional<OrderEntity>> future = new CompletableFuture<>();
        orderRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                OrderEntity order = snapshot.getValue(OrderEntity.class);
                future.complete(Optional.ofNullable(order));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }
    public CompletableFuture<List<OrderEntity>> getOrdersByUserId(String userId) {
        CompletableFuture<List<OrderEntity>> future = new CompletableFuture<>();
        orderRef.orderByChild("userId").equalTo(userId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<OrderEntity> orders = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    OrderEntity order = child.getValue(OrderEntity.class);
                    orders.add(order);
                }
                future.complete(orders);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public void createOrder(String id, OrderEntity order) {
        orderRef.child(id).setValueAsync(order);
    }

    public void updateOrder(String id, OrderEntity updatedOrder) {
        orderRef.child(id).setValueAsync(updatedOrder);
    }

    public void deleteOrder(String id) {
        orderRef.child(id).removeValueAsync();
    }
}