package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.PaymentEntity;
import edu.cit.sapatosan.entity.UserEntity;
import edu.cit.sapatosan.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<Void> createPayment(
            @PathVariable String orderId,
            @RequestBody PaymentEntity payment,
            Authentication authentication) {
        // Fetch the logged-in user
        String userId = authentication.getName(); // Assuming userId is the principal
        // You'll need to fetch the UserEntity here using UserService
        // For simplicity, assuming user details are passed or fetched elsewhere
        paymentService.createPayment(orderId, payment, new UserEntity()); // Replace with actual user
        return ResponseEntity.ok().build();
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentEntity> getPaymentByOrderId(@PathVariable String orderId) {
        try {
            Optional<PaymentEntity> payment = paymentService.getPaymentByOrderId(orderId).get();
            return payment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable String paymentId) {
        paymentService.deletePayment(paymentId);
        return ResponseEntity.noContent().build();
    }
}