package com.Product.Shop.Service;

import org.springframework.data.domain.Page;

import com.Product.Shop.Payload.Dto.CustomerDto.CustomerRequestDto;
import com.Product.Shop.Payload.Dto.CustomerDto.CustomerResponseDto;

public interface CustomerService {
    Page<CustomerResponseDto> listAll(String search, String name, String email, String state, String country, int page, int size, String sortBy, String sortDir);
    CustomerResponseDto get(Long id);
    CustomerResponseDto save(CustomerRequestDto customer);
    CustomerResponseDto update(Long id, CustomerRequestDto customer);
    void delete(Long id);
}
