package edu.cit.sapatosan.controller;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.service.CartService;
import edu.cit.sapatosan.dto.AddProductToCartRequest; // Import the DTO

@RestController
@RequestMapping("/api/carts")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartEntity>> getAllCarts() throws ExecutionException, InterruptedException {
        List<CartEntity> carts = cartService.getAllCarts().get();
        return ResponseEntity.ok(carts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartEntity> getCartById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Optional<CartEntity> cart = cartService.getCartById(id).get();
        return cart.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CartEntity> getCartByUserId(@PathVariable String userId) throws ExecutionException, InterruptedException {
        Optional<CartEntity> cart = cartService.getCartByUserId(userId).get();
        return cart.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Modified to accept request body
    @PostMapping("/{userId}/add-product")
    public ResponseEntity<Void> addProductToCart(
            @PathVariable String userId,
            @RequestBody AddProductToCartRequest request) { // Use the DTO
        try {
            // Validate inputs
            if (request.getProductId() == null || request.getProductId().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            int quantity = request.getQuantity();
            if (quantity <= 0) {
                quantity = 1; // Default to 1 if invalid quantity
            }

            cartService.addProductToCart(userId, request.getProductId(), quantity);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Log the error
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCart(@PathVariable String id, @RequestBody CartEntity updatedCart) {
        cartService.updateCart(id, updatedCart);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCart(@PathVariable String id) {
        cartService.deleteCart(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/remove-product/{productId}")
    public ResponseEntity<Void> removeProductFromCart(
            @PathVariable String userId,
            @PathVariable String productId) {
        try {
            cartService.removeProductFromCart(userId, productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}