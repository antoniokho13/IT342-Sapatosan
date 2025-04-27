package edu.cit.sapatosan.controller;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import edu.cit.sapatosan.entity.CartProductEntity;

@RestController
@RequestMapping("/api/carts/products")
public class CartProductController {
    
    private final DatabaseReference cartProductRef;
    
    public CartProductController() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.cartProductRef = database.getReference("cartProducts");
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CartProductEntity> getCartProductById(@PathVariable String id) throws ExecutionException, InterruptedException {
        CompletableFuture<Optional<CartProductEntity>> future = new CompletableFuture<>();
        
        cartProductRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                CartProductEntity cartProduct = snapshot.getValue(CartProductEntity.class);
                if (cartProduct != null) {
                    cartProduct.setId(snapshot.getKey());
                }
                future.complete(Optional.ofNullable(cartProduct));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        
        Optional<CartProductEntity> cartProduct = future.get();
        return cartProduct.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartProduct(@PathVariable String id) throws ExecutionException, InterruptedException {
        CompletableFuture<Optional<CartProductEntity>> future = new CompletableFuture<>();
        
        // First get the cart product to find its cartId
        cartProductRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                CartProductEntity cartProduct = snapshot.getValue(CartProductEntity.class);
                if (cartProduct != null) {
                    cartProduct.setId(snapshot.getKey());
                }
                future.complete(Optional.ofNullable(cartProduct));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        
        Optional<CartProductEntity> optCartProduct = future.get();
        
        if (optCartProduct.isPresent()) {
            String cartId = optCartProduct.get().getCartId();
            
            // Remove the cart product ID from cart's cartProductIds list
            CompletableFuture<Void> removalFuture = new CompletableFuture<>();
            
            DatabaseReference cartRef = FirebaseDatabase.getInstance().getReference("carts").child(cartId).child("cartProductIds");
            cartRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    if (snapshot.exists()) {
                        for (DataSnapshot childSnapshot : snapshot.getChildren()) {
                            if (id.equals(childSnapshot.getValue(String.class))) {
                                childSnapshot.getRef().removeValueAsync();
                                break;
                            }
                        }
                    }
                    
                    // Now remove the cart product itself
                    cartProductRef.child(id).removeValueAsync();
                    removalFuture.complete(null);
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    removalFuture.completeExceptionally(error.toException());
                }
            });
            
            removalFuture.get();
        } else {
            // If cart product doesn't exist, just return success
            cartProductRef.child(id).removeValueAsync();
        }
        
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping
    public ResponseEntity<Void> addCartProduct(@RequestBody CartProductEntity cartProduct) {
        String id = cartProductRef.push().getKey();
        if (id != null) {
            cartProduct.setId(id);
            cartProductRef.child(id).setValueAsync(cartProduct);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(500).build();
    }
}
