package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.entity.CartProductEntity;
import edu.cit.sapatosan.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CartEntity> viewCart(@PathVariable Long userId) {
        CartEntity cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{userId}/products/{productId}/{quantity}")
    public ResponseEntity<CartProductEntity> addProductToCart(@PathVariable Long userId, @PathVariable Long productId, @PathVariable Integer quantity) {
        CartProductEntity cartProduct = cartService.addProductToCart(userId, productId, quantity);
        return ResponseEntity.ok(cartProduct);
    }

    @PutMapping("/{userId}/products/{productId}/{quantity}")
    public ResponseEntity<CartProductEntity> updateProductQuantityInCart(@PathVariable Long userId, @PathVariable Long productId, @PathVariable Integer quantity) {
        CartProductEntity cartProduct = cartService.updateProductQuantityInCart(userId, productId, quantity);
        return ResponseEntity.ok(cartProduct);
    }

    @DeleteMapping("/{userId}/products/{productId}")
    public ResponseEntity<Void> removeProductFromCart(@PathVariable Long userId, @PathVariable Long productId) {
        cartService.removeProductFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}