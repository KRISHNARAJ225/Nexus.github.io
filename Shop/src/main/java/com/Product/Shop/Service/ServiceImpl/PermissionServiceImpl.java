package com.Product.Shop.Service.ServiceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.Product.Shop.Model.Permission;
import com.Product.Shop.Repository.PermissionRepository;
import com.Product.Shop.Service.PermissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository repository;

    @Override
    public Page<Permission> listAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findByDeletedFalse(pageable);
    }

    @Override
    public Permission get(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Permission save(Permission permission) {
        return repository.save(permission);
    }

    @Override
    public Permission update(Long id, Permission permission) {
        Permission existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Permission Not Found"));
        existing.setName(permission.getName());
        existing.setDescription(permission.getDescription());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        Permission existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Permission Not Found"));
        existing.setDeleted(true);
        repository.save(existing);
    }
}
