package edu.cit.sapatosan.repository;

import edu.cit.sapatosan.entity.OrderProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderProductRepository extends JpaRepository<OrderProductEntity, Long> {
    // Custom query methods can be defined here if needed
    // For example, to find all products in a specific order:
    List<OrderProductEntity> findByOrderId(Long orderId);
}
