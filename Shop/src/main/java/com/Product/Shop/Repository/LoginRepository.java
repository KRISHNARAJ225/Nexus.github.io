package com.Product.Shop.Repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Product.Shop.Model.Login;

@Repository
public interface LoginRepository extends JpaRepository<Login, Long> {
    Optional<Login> findByUsername(String username);
    Optional<Login> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<Login> findByDeletedFalse();
}

