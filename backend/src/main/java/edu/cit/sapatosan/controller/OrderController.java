package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/from-cart/{userId}")
    public ResponseEntity<String> createOrderFromCart(
            @PathVariable String userId,
            @RequestBody OrderEntity orderDetails) {
        try {
            String orderId = orderService.createOrderFromCart(userId, orderDetails);
            return ResponseEntity.ok(orderId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderEntity>> getAllOrders() {
        List<OrderEntity> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderEntity> getOrderById(@PathVariable String orderId) {
        Optional<OrderEntity> order = orderService.getOrderById(orderId);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{orderId}")
    public ResponseEntity<Void> updatePaymentStatus(
            @PathVariable String orderId,
            @RequestParam OrderEntity.PaymentStatus paymentStatus) {
        orderService.updatePaymentStatus(orderId, paymentStatus);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable String orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}