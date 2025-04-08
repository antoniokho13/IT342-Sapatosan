package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.entity.CartProductEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class CartService {
    private final DatabaseReference cartRef;
    private final DatabaseReference cartProductRef;

    public CartService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.cartRef = database.getReference("carts");
        this.cartProductRef = database.getReference("cartProducts");
    }

    public CompletableFuture<Optional<CartEntity>> getCartById(String id) {
        CompletableFuture<Optional<CartEntity>> future = new CompletableFuture<>();
        cartRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                CartEntity cart = snapshot.getValue(CartEntity.class);
                future.complete(Optional.ofNullable(cart));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public void createCart(String id, CartEntity cart) {
        cartRef.child(id).setValueAsync(cart);
    }

    public void updateCart(String id, CartEntity updatedCart) {
        cartRef.child(id).setValueAsync(updatedCart);
    }

    public void deleteCart(String id) {
        cartRef.child(id).removeValueAsync();
    }
}