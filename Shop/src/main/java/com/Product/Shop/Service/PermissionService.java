package com.Product.Shop.Service;

import org.springframework.data.domain.Page;

import com.Product.Shop.Model.Permission;

public interface PermissionService {
    Page<Permission> listAll(int page, int size);
    Permission get(Long id);
    Permission save(Permission permission);
    Permission update(Long id, Permission permission);
    void delete(Long id);
}
