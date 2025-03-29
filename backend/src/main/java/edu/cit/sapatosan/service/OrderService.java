package edu.cit.sapatosan.service;

import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<OrderEntity> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public OrderEntity createOrder(OrderEntity order) {
        order.setOrderDate(new Date());
        return orderRepository.save(order);
    }

    public Optional<OrderEntity> updateOrder(Long id, OrderEntity updatedOrder) {
        return orderRepository.findById(id).map(order -> {
            order.setUserId(updatedOrder.getUserId());
            order.setOrderDate(updatedOrder.getOrderDate());
            order.setTotalAmount(updatedOrder.getTotalAmount());
            order.setStatus(updatedOrder.getStatus());
            order.setQuantity(updatedOrder.getQuantity());
            order.setPrice(updatedOrder.getPrice());
            return orderRepository.save(order);
        });
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}