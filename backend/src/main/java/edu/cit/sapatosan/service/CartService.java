package edu.cit.sapatosan.service;

import java.util.ArrayList;
import java.util.List;
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
import edu.cit.sapatosan.entity.CartProductEntity;

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
                if (cart != null) {
                    cart.setId(snapshot.getKey());
                }
                future.complete(Optional.ofNullable(cart));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public CompletableFuture<List<CartEntity>> getAllCarts() {
        CompletableFuture<List<CartEntity>> future = new CompletableFuture<>();

        cartRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<CartEntity> carts = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    CartEntity cart = child.getValue(CartEntity.class);
                    if (cart != null) {
                        cart.setId(child.getKey()); // important to set ID manually
                        carts.add(cart);
                    }
                }
                future.complete(carts);
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

    public void addProductToCart(String userId, String productId, int quantity) throws ExecutionException, InterruptedException {
        Optional<CartEntity> cartOptional = getCartByUserId(userId).get();

        if (cartOptional.isPresent()) {
            CartEntity cart = cartOptional.get();
            String cartId = cart.getId();

            if (cart.getCartProductIds() == null) {
                cart.setCartProductIds(new ArrayList<>()); // Initialize if null
            }

            Optional<CartProductEntity> existingCartProductOptional =
                getCartProductByCartIdAndProductId(cartId, productId).get();

            if (existingCartProductOptional.isPresent()) {
                CartProductEntity existingCartProduct = existingCartProductOptional.get();
                int newQuantity = existingCartProduct.getQuantity() + quantity;
                existingCartProduct.setQuantity(newQuantity);

                cartProductRef.child(existingCartProduct.getId()).setValueAsync(existingCartProduct).get();
            } else {
                CartProductEntity cartProduct = new CartProductEntity();
                cartProduct.setCartId(cartId);
                cartProduct.setProductId(productId);
                cartProduct.setQuantity(quantity);

                String cartProductId = cartProductRef.push().getKey();
                cartProduct.setId(cartProductId);
                cartProductRef.child(cartProductId).setValueAsync(cartProduct).get();

                cart.getCartProductIds().add(cartProductId);
            }

            cartRef.child(cartId).child("cartProductIds").setValueAsync(cart.getCartProductIds()).get();
            System.out.println("Updated cart: " + cart); // Log the updated cart
        } else {
            CartEntity cart = new CartEntity();
            cart.setUserId(userId);
            cart.setStatus("ACTIVE");
            cart.setCartProductIds(new ArrayList<>()); // Initialize as empty list

            CartProductEntity cartProduct = new CartProductEntity();
            cartProduct.setProductId(productId);
            cartProduct.setQuantity(quantity);

            String cartId = cartRef.push().getKey();
            cart.setId(cartId);

            String cartProductId = cartProductRef.push().getKey();
            cartProduct.setId(cartProductId);
            cartProduct.setCartId(cartId);

            cart.getCartProductIds().add(cartProductId);

            cartRef.child(cartId).setValueAsync(cart).get();
            cartProductRef.child(cartProductId).setValueAsync(cartProduct).get();

            System.out.println("Created new cart: " + cart); // Log the new cart
        }
    }

    public CompletableFuture<Optional<CartEntity>> getCartByUserId(String userId) {
        CompletableFuture<Optional<CartEntity>> future = new CompletableFuture<>();
        
        cartRef.orderByChild("userId").equalTo(userId).limitToFirst(1)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    if (snapshot.exists()) {
                        for (DataSnapshot cartSnapshot : snapshot.getChildren()) {
                            CartEntity cart = cartSnapshot.getValue(CartEntity.class);
                            cart.setId(cartSnapshot.getKey());
                            System.out.println("Cart found for userId: " + userId + ", cart: " + cart);
                            future.complete(Optional.of(cart));
                            return;
                        }
                    }
                    System.out.println("No cart found for userId: " + userId);
                    future.complete(Optional.empty());
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    System.err.println("Error fetching cart for userId: " + userId + ", error: " + error.getMessage());
                    future.completeExceptionally(error.toException());
                }
            });
        
        return future;
    }

    private CompletableFuture<Optional<CartProductEntity>> getCartProductByCartIdAndProductId(String cartId, String productId) {
        CompletableFuture<Optional<CartProductEntity>> future = new CompletableFuture<>();
        
        // Query cartProducts by cartId and productId
        cartProductRef.orderByChild("cartId").equalTo(cartId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot childSnapshot : snapshot.getChildren()) {
                    CartProductEntity cartProduct = childSnapshot.getValue(CartProductEntity.class);
                    if (cartProduct != null) {
                        cartProduct.setId(childSnapshot.getKey());
                        if (productId.equals(cartProduct.getProductId())) {
                            future.complete(Optional.of(cartProduct));
                            return;
                        }
                    }
                }
                future.complete(Optional.empty());
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        
        return future;
    }
}
