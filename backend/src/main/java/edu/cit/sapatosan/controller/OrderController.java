package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PutMapping("/{orderId}/payment/{paymentId}")
    public ResponseEntity<Void> associatePaymentWithOrder(@PathVariable String orderId, @PathVariable String paymentId) {
        orderService.associatePaymentWithOrder(orderId, paymentId);
        return ResponseEntity.ok().build();
    }
    @PostMapping
    public ResponseEntity<Void> createOrder(@RequestBody OrderEntity order) {
        orderService.createOrder(order);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<Void> updateOrder(@PathVariable String orderId, @RequestBody OrderEntity updatedOrder) {
        orderService.updateOrder(orderId, updatedOrder);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable String orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{orderId}")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable String orderId, @RequestBody String status) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok().build();
    }
}