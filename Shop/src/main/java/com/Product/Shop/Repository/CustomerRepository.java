package com.Product.Shop.Repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Product.Shop.Model.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByName(String name);
    Optional<Customer> findByEmail(String email);
    Page<Customer> findByDeletedFalse(Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE " +
           "c.deleted = false AND " +
           "(cast(:search as string) IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(cast(:name as string) IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(cast(:email as string) IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(cast(:state as string) IS NULL OR LOWER(c.state) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
           "(cast(:country as string) IS NULL OR LOWER(c.country) LIKE LOWER(CONCAT('%', :country, '%')))")
    Page<Customer> searchAndFilter(
        @Param("search") String search,
        @Param("name") String name,
        @Param("email") String email,
        @Param("state") String state,
        @Param("country") String country,
        Pageable pageable
    );
}
