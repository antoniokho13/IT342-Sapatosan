package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.service.OrderService;
import edu.cit.sapatosan.entity.PaymentEntity; // Import PaymentEntity
import edu.cit.sapatosan.service.PaymentService; // Import PaymentService
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final PaymentService paymentService; // Inject PaymentService

    public OrderController(OrderService orderService, PaymentService paymentService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    @PutMapping("/{orderId}/payment/{paymentId}")
    public ResponseEntity<Void> associatePaymentWithOrder(@PathVariable String orderId, @PathVariable String paymentId) {
        orderService.associatePaymentWithOrder(orderId, paymentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Void> createOrder(@RequestBody OrderEntity order) {
        // Create the order
        String orderId = orderService.createOrder(order);

        // Create the payment
        PaymentEntity payment = new PaymentEntity();
        payment.setAmount(order.getTotalAmount());
        payment.setDescription("Payment for order " + orderId);

        paymentService.createPayment(orderId, payment);

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