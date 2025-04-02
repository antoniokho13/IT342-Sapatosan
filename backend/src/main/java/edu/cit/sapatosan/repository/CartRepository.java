package edu.cit.sapatosan.repository;

import edu.cit.sapatosan.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {
    CartEntity findByUserId(Long userId);
    List<CartEntity> findByUserIdAndStatus(Long userId, String status);
}