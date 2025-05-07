package edu.cit.sapatosan.controller;

import com.fasterxml.jackson.databind.JsonNode;
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
                JsonNode data = payload.get("data").get("attributes").get("data").get("attributes");
                String orderId = data.has("metadata") && data.get("metadata").has("order_id")
                        ? data.get("metadata").get("order_id").asText()
                        : null;

                if (orderId != null) {
                    orderService.updatePaymentStatus(orderId, OrderEntity.PaymentStatus.PAID);
                    return ResponseEntity.ok().build();
                } else {
                    System.err.println("Order ID not found in webhook payload.");
                    return ResponseEntity.badRequest().build();
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}