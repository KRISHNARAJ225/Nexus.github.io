package com.Product.Shop.Service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.Product.Shop.Payload.Dto.ProductDto.ProductRequestDto;
import com.Product.Shop.Payload.Dto.ProductDto.ProductResponseDto;

public interface ProductService {
    Page<ProductResponseDto> listAll(String search, String code, Long divisionId, Double minPrice, Double maxPrice, int page, int size, String sortBy, String sortDir);
    ProductResponseDto get(Long id);
    ProductResponseDto update(Long id, ProductRequestDto dto);
    void delete(Long id);
    List<ProductResponseDto> findByCategory(Long categoryId);
    ProductResponseDto save(ProductRequestDto dto);
    List<ProductResponseDto> findByCustomer(Long customerId);
}
