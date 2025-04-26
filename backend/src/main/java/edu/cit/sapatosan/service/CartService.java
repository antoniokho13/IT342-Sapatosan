package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.entity.CartProductEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

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

    public void addProductToCart(String userId, String productId, int quantity) throws ExecutionException, InterruptedException {
        CompletableFuture<Optional<CartEntity>> cartFuture = getCartByUserId(userId);
        Optional<CartEntity> optionalCart = cartFuture.get();

        CartEntity cart;
        if (optionalCart.isEmpty()) {
            cart = new CartEntity();
            cart.setId(cartRef.push().getKey());
            cart.setUserId(userId);
            cart.setStatus("ACTIVE");
            cart.setCartProductIds(new ArrayList<>());
            createCart(cart.getId(), cart);
        } else {
            cart = optionalCart.get();
        }

        String cartId = cart.getId();
        CompletableFuture<Optional<CartProductEntity>> cartProductFuture = getCartProductByCartIdAndProductId(cartId, productId);
        Optional<CartProductEntity> optionalCartProduct = cartProductFuture.get();

        if (optionalCartProduct.isPresent()) {
            CartProductEntity cartProduct = optionalCartProduct.get();
            cartProduct.setQuantity(cartProduct.getQuantity() + quantity);
            cartProductRef.child(cartProduct.getId()).setValueAsync(cartProduct);
        } else {
            CartProductEntity cartProduct = new CartProductEntity();
            cartProduct.setId(cartProductRef.push().getKey());
            cartProduct.setCartId(cartId);
            cartProduct.setProductId(productId);
            cartProduct.setQuantity(quantity);
            cartProductRef.child(cartProduct.getId()).setValueAsync(cartProduct);

            cart.getCartProductIds().add(cartProduct.getId());
            cartRef.child(cartId).setValueAsync(cart);
        }
    }

    private CompletableFuture<Optional<CartEntity>> getCartByUserId(String userId) {
        CompletableFuture<Optional<CartEntity>> future = new CompletableFuture<>();
        cartRef.orderByChild("userId").equalTo(userId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot child : snapshot.getChildren()) {
                    CartEntity cart = child.getValue(CartEntity.class);
                    if (cart != null) {
                        cart.setId(child.getKey());
                        future.complete(Optional.of(cart));
                        return;
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

    private CompletableFuture<Optional<CartProductEntity>> getCartProductByCartIdAndProductId(String cartId, String productId) {
        CompletableFuture<Optional<CartProductEntity>> future = new CompletableFuture<>();
        cartProductRef.orderByChild("cartId").equalTo(cartId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot child : snapshot.getChildren()) {
                    CartProductEntity cartProduct = child.getValue(CartProductEntity.class);
                    if (cartProduct != null && cartProduct.getProductId().equals(productId)) {
                        cartProduct.setId(child.getKey());
                        future.complete(Optional.of(cartProduct));
                        return;
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