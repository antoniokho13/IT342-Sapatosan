package edu.cit.sapatosan.repository;

import edu.cit.sapatosan.entity.CartProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CartProductRepository extends JpaRepository<CartProductEntity,Long> {
    CartProductEntity findByCartIdAndProductId(Long cartId, Long productId);
    void deleteByCartIdAndProductId(Long cartId, Long productId);

    // For analytics
    @Query("SELECT SUM(cp.quantity) FROM CartProductEntity cp WHERE cp.product.id = :productId")
    Integer getTotalQuantityByProductId(@Param("productId") Long productId);
}
