package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/carts")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartEntity> getCartById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Optional<CartEntity> cart = cartService.getCartById(id).get();
        return cart.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Void> createCart(@RequestBody CartEntity cart) {
        cartService.createCart(cart.getId(), cart);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/add-product")
    public ResponseEntity<Void> addProductToCart(@PathVariable String userId, @RequestParam String productId, @RequestParam int quantity) throws ExecutionException, InterruptedException {
        cartService.addProductToCart(userId, productId, quantity);
        return ResponseEntity.ok().build();
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
}