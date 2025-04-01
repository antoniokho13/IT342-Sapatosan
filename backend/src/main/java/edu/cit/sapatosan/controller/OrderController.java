// OrderController.java
package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Endpoint to list all orders of a user by userId
    @GetMapping("/list")
    public ResponseEntity<List<OrderEntity>> listUserOrders(@RequestParam Long userId) {
        List<OrderEntity> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    // Endpoint to get details of a specific order by orderId
    @GetMapping("/details/{id}")
    public ResponseEntity<OrderEntity> getOrderDetails(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to create an order from the cart of a user
    @PostMapping("/createFromCart/{userId}")
    public ResponseEntity<OrderEntity> createOrderFromCart(@PathVariable Long userId) {
        OrderEntity order = orderService.createOrderFromCart(userId);
        return ResponseEntity.ok(order);
    }

    // Endpoint to create a direct order for a user with a specific product and quantity
    @PostMapping("/createDirectOrder/{userId}/{productId}/{quantity}")
    public ResponseEntity<OrderEntity> createDirectOrder(@PathVariable Long userId, @PathVariable Long productId, @PathVariable Integer quantity) {
        OrderEntity order = orderService.createDirectOrder(userId, productId, quantity);
        return ResponseEntity.ok(order);
    }
}