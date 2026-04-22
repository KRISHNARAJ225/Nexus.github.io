package com.Product.Shop.Service.ServiceImpl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.Product.Shop.Model.Division;
import com.Product.Shop.Model.Product;
import com.Product.Shop.Payload.Dto.ProductDto.ProductRequestDto;
import com.Product.Shop.Payload.Dto.ProductDto.ProductResponseDto;
import com.Product.Shop.Repository.DivisionRepository;
import com.Product.Shop.Repository.ProductRepository;
import com.Product.Shop.Service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository;
    private final DivisionRepository divisionRepository;

    @Override
    public Page<ProductResponseDto> listAll(String search, String code, Long divisionId, Double minPrice, Double maxPrice, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return repository.searchAndFilter(search, code, divisionId, minPrice, maxPrice, pageable).map(this::mapToDto);
    }

    @Override
    public ProductResponseDto get(Long id) {
        return mapToDto(repository.findById(id).orElseThrow(() -> new RuntimeException("Product Not Found")));
    }

    @Override
    public ProductResponseDto save(ProductRequestDto dto) {
        String divisionName = dto.getDivisionName() != null ? dto.getDivisionName().trim() : null;
        if (divisionName == null || divisionName.isBlank()) {
            throw new RuntimeException("Division name is required");
        }
        Division division = divisionRepository.findByNameIgnoreCase(divisionName)
                .orElseThrow(() -> new RuntimeException("Division not found"));

        Product p = new Product();
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setQuantity(dto.getQuantity());
        p.setCode("P" + System.currentTimeMillis());
        p.setSku(dto.getSku());
        p.setUom(dto.getUom());
        p.setExpiryDate(dto.getExpiryDate());
        p.setSaleableStock(dto.getSaleableStock());
        p.setNonSaleableStock(dto.getNonSaleableStock());
        p.setDivision(division);
        p.setDivisionName(division.getName());

        return mapToDto(repository.save(p));
    }

    @Override
    public ProductResponseDto update(Long id, ProductRequestDto dto) {
        String divisionName = dto.getDivisionName() != null ? dto.getDivisionName().trim() : null;
        if (divisionName == null || divisionName.isBlank()) {
            throw new RuntimeException("Division name is required");
        }
        Division division = divisionRepository.findByNameIgnoreCase(divisionName)
                .orElseThrow(() -> new RuntimeException("Division not found"));

        Product p = repository.findById(id).orElseThrow(() -> new RuntimeException("Product Not Found"));
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setQuantity(dto.getQuantity());
        p.setSku(dto.getSku());
        p.setUom(dto.getUom());
        p.setExpiryDate(dto.getExpiryDate());
        p.setSaleableStock(dto.getSaleableStock());
        p.setNonSaleableStock(dto.getNonSaleableStock());
        p.setDivision(division);
        p.setDivisionName(divisionName);

        return mapToDto(repository.save(p));
    }

    @Override
    public void delete(Long id) {
        Product existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Product Not Found"));
        existing.setDeleted(true);
        repository.save(existing);
    }

    @Override
    public List<ProductResponseDto> findByCategory(Long categoryId) {
        return repository.findByDivisionId(categoryId).stream().map(this::mapToDto).toList();
    }

    @Override
    public List<ProductResponseDto> findByCustomer(Long customerId) {
        return List.of();
    }

    private ProductResponseDto mapToDto(Product product) {
        ProductResponseDto dto = new ProductResponseDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setExpiryDate(product.getExpiryDate());
        dto.setDivisionName(product.getDivision() != null ? product.getDivision().getName() : null);
        return dto;
    }
}
