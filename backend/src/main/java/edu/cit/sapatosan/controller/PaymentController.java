package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.PaymentEntity;
import edu.cit.sapatosan.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    //Push na ni oy
    @PostMapping("/{orderId}")
    public ResponseEntity<Void> createPayment(@PathVariable String orderId, @RequestBody PaymentEntity payment) {
        paymentService.createPayment(orderId, payment);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable String paymentId) {
        paymentService.deletePayment(paymentId);
        return ResponseEntity.noContent().build();
    }
}