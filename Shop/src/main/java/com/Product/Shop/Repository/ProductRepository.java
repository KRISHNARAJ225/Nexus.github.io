package com.Product.Shop.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Product.Shop.Model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByDivisionId(Long id);
    Page<Product> findByDeletedFalse(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND " +
           "(cast(:search as string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(cast(:code as string) IS NULL OR LOWER(p.code) LIKE LOWER(CONCAT('%', :code, '%'))) AND " +
           "(:divisionId IS NULL OR p.division.id = :divisionId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchAndFilter(
        @Param("search") String search,
        @Param("code") String code,
        @Param("divisionId") Long divisionId,
        @Param("minPrice") Double minPrice,
        @Param("maxPrice") Double maxPrice,
        Pageable pageable
    );
}




