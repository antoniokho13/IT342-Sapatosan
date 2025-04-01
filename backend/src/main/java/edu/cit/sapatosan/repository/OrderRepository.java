package edu.cit.sapatosan.repository;

import edu.cit.sapatosan.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserId(Long userId);
    List<OrderEntity> findByOrderDateBetween(Date startDate, Date endDate);
    // For sales reports
    @Query("SELECT SUM(o.totalAmount) FROM OrderEntity o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    Double getTotalSalesBetweenDates(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
}