package edu.cit.sapatosan.controller;

import com.fasterxml.jackson.databind.JsonNode;
import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.entity.PaymentEntity;
import edu.cit.sapatosan.entity.UserEntity;
import edu.cit.sapatosan.service.OrderService;
import edu.cit.sapatosan.service.PaymentService;
import edu.cit.sapatosan.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final UserService userService;

    public OrderController(OrderService orderService, PaymentService paymentService, UserService userService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.userService = userService;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderEntity> getOrderById(@PathVariable String orderId) {
        try {
            Optional<OrderEntity> order = orderService.getOrderById(orderId);
            return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/from-cart/{userId}")
    public ResponseEntity<?> createOrderFromCart(
            @PathVariable String userId,
            @RequestBody OrderEntity orderDetails,
            Authentication authentication) {
        try {
            // Fetch the logged-in user
            String username = authentication.getName(); // Assuming email is the username
            Optional<UserEntity> userOptional = userService.getUserById(userId).get();
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }
            UserEntity user = userOptional.get();

            String orderId = orderService.createOrderFromCart(userId, orderDetails, user);
            Optional<OrderEntity> orderOptional = orderService.getOrderById(orderId);
            if (orderOptional.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to retrieve created order");
            }

            Optional<PaymentEntity> paymentOptional = paymentService.getPaymentByOrderId(orderId).get();
            if (paymentOptional.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to retrieve payment for order");
            }

            // Return order and payment details
            return ResponseEntity.ok(new OrderResponse(orderOptional.get(), paymentOptional.get()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/confirmation/{orderId}")
    public ResponseEntity<?> getOrderConfirmation(
            @PathVariable String orderId,
            Authentication authentication) {
        try {
            // Fetch the logged-in user
            String userId = authentication.getName(); // Assuming userId is the principal
            Optional<UserEntity> userOptional = userService.getUserById(userId).get();
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }
            UserEntity user = userOptional.get();

            Optional<OrderEntity> orderOptional = orderService.getOrderById(orderId);
            if (orderOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Order not found");
            }

            Optional<PaymentEntity> paymentOptional = paymentService.getPaymentByOrderId(orderId).get();
            if (paymentOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Payment not found for order");
            }

            return ResponseEntity.ok(new ConfirmationResponse(user, orderOptional.get(), paymentOptional.get().getLink()));
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderEntity>> getOrdersByUserId(@PathVariable String userId) {
        List<OrderEntity> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/webhook/paymongo")
    public ResponseEntity<Void> handlePayMongoWebhook(@RequestBody JsonNode payload) {
        try {
            String eventType = payload.get("data").get("attributes").get("type").asText();
            if ("link.payment.paid".equals(eventType)) {
                String linkId = payload.get("data").get("attributes").get("data").get("attributes").get("link_id").asText();
                Optional<PaymentEntity> paymentOptional = paymentService.getPaymentByLinkId(linkId).get();
                if (paymentOptional.isPresent()) {
                    PaymentEntity payment = paymentOptional.get();
                    String orderId = payment.getOrderId();
                    orderService.updatePaymentStatus(orderId, OrderEntity.PaymentStatus.PAID);
                    payment.setStatus("completed");
                    paymentService.updatePayment(payment); // Use PaymentService to update the payment
                    return ResponseEntity.ok().build();
                } else {
                    System.err.println("Payment not found for link ID: " + linkId);
                    return ResponseEntity.badRequest().build();
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Response DTOs
    public static class OrderResponse {
        private OrderEntity order;
        private PaymentEntity payment;

        public OrderResponse(OrderEntity order, PaymentEntity payment) {
            this.order = order;
            this.payment = payment;
        }

        public OrderEntity getOrder() { return order; }
        public PaymentEntity getPayment() { return payment; }
    }

    public static class ConfirmationResponse {
        private UserEntity user;
        private OrderEntity order;
        private String paymentLink;

        public ConfirmationResponse(UserEntity user, OrderEntity order, String paymentLink) {
            this.user = user;
            this.order = order;
            this.paymentLink = paymentLink;
        }

        public UserEntity getUser() { return user; }
        public OrderEntity getOrder() { return order; }
        public String getPaymentLink() { return paymentLink; }
    }
}