package edu.cit.sapatosan.controller;

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

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable String orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}