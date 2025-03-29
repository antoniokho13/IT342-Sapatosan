package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.entity.OrderEntity;
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

    @GetMapping("/getAllCarts")
    public ResponseEntity<List<CartEntity>> getAllCarts() {
        List<CartEntity> carts = cartService.getAllCarts();
        return ResponseEntity.ok(carts);
    }

    @GetMapping("/getCartById/{id}")
    public ResponseEntity<CartEntity> getCartById(@PathVariable Long id) {
        return cartService.getCartById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/createCart")
    public ResponseEntity<CartEntity> createCart(@RequestBody CartEntity cart) {
        CartEntity createdCart = cartService.createCart(cart);
        return ResponseEntity.ok(createdCart);
    }

    @PutMapping("/updateCart/{id}")
    public ResponseEntity<CartEntity> updateCart(@PathVariable Long id, @RequestBody CartEntity updatedCart) {
        return cartService.updateCart(id, updatedCart)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/deleteCart/{id}")
    public ResponseEntity<Void> deleteCart(@PathVariable Long id) {
        cartService.deleteCart(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/addProductToCart")
    public ResponseEntity<CartEntity> addProductToCart(@RequestParam Long userId, @RequestParam Long productId, @RequestParam Integer quantity, @RequestParam Double price) {
        CartEntity cart = cartService.addProductToCart(userId, productId, quantity, price);
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/getCartContents")
    public ResponseEntity<List<CartEntity>> getCartContents(@RequestParam Long userId) {
        List<CartEntity> cartContents = cartService.getCartContents(userId);
        return ResponseEntity.ok(cartContents);
    }

    @DeleteMapping("/removeProductFromCart")
    public ResponseEntity<Void> removeProductFromCart(@RequestParam Long userId, @RequestParam Long productId) {
        cartService.removeProductFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderEntity> checkoutCart(@RequestParam Long userId) {
        OrderEntity order = cartService.checkoutCart(userId);
        return ResponseEntity.ok(order);
    }
}