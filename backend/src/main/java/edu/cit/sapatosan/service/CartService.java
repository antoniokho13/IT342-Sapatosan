package edu.cit.sapatosan.service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import edu.cit.sapatosan.entity.CartEntity;

@Service
public class CartService {
    private final DatabaseReference cartRef;

    public CartService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.cartRef = database.getReference("carts");
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

            // Initialize cartProductIds if null
            if (cart.getCartProductIds() == null) {
                cart.setCartProductIds(new HashMap<>());
            }

            Map<String, Integer> cartProducts = cart.getCartProductIds();

            // Update quantity if product exists, otherwise add new product
            if (cartProducts.containsKey(productId)) {
                int currentQuantity = cartProducts.get(productId);
                cartProducts.put(productId, currentQuantity + quantity);
            } else {
                cartProducts.put(productId, quantity);
            }

            cartRef.child(cartId).setValueAsync(cart).get();
            System.out.println("Updated cart: " + cart); // Log the updated cart
        } else {
            CartEntity cart = new CartEntity();
            cart.setUserId(userId);
            cart.setStatus("ACTIVE");

            // Initialize cartProductIds with the new product
            Map<String, Integer> cartProducts = new HashMap<>();
            cartProducts.put(productId, quantity);
            cart.setCartProductIds(cartProducts);

            String cartId = cartRef.push().getKey();
            cart.setId(cartId);

            cartRef.child(cartId).setValueAsync(cart).get();

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

    public void removeProductFromCart(String userId, String productId) throws ExecutionException, InterruptedException {
        Optional<CartEntity> cartOptional = getCartByUserId(userId).get();

        if (cartOptional.isPresent()) {
            CartEntity cart = cartOptional.get();
            String cartId = cart.getId();

            if (cart.getCartProductIds() != null) {
                Map<String, Integer> cartProducts = cart.getCartProductIds();

                if (cartProducts.containsKey(productId)) {
                    int currentQuantity = cartProducts.get(productId);
                    if (currentQuantity > 1) {
                        // Decrease the quantity by 1
                        cartProducts.put(productId, currentQuantity - 1);
                    } else {
                        // Remove the product if the quantity is 1
                        cartProducts.remove(productId);
                    }

                    cart.setCartProductIds(cartProducts);
                    cartRef.child(cartId).setValueAsync(cart).get();
                    System.out.println("Updated cart after removing product: " + cart);
                } else {
                    System.out.println("Product not found in cart.");
                }
            } else {
                System.out.println("Cart is empty.");
            }
        } else {
            System.out.println("Cart not found for userId: " + userId);
        }
    }
}