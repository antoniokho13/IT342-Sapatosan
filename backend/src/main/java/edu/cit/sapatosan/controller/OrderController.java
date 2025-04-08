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

    @GetMapping
    public ResponseEntity<List<OrderEntity>> listUserOrders(@RequestParam String userId) throws ExecutionException, InterruptedException {
        List<OrderEntity> orders = orderService.getOrdersByUserId(userId).get();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderEntity> getOrderDetails(@PathVariable String id) throws ExecutionException, InterruptedException {
        Optional<OrderEntity> order = orderService.getOrderById(id).get();
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Void> createOrder(@RequestBody OrderEntity order) {
        orderService.createOrder(order.getId(), order);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateOrder(@PathVariable String id, @RequestBody OrderEntity updatedOrder) {
        orderService.updateOrder(id, updatedOrder);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}