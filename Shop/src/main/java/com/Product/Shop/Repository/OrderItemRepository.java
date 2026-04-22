package com.Product.Shop.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Product.Shop.Model.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findByDeletedFalse();

    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.product.id = :productId
        AND oi.order.status = 'CONFIRMED'
        """)
    int getTotalQuantityByProductId(@Param("productId") Long productId);
}
