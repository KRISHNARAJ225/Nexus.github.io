package com.Product.Shop.Payload.Dto.ProductDto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ProductResponseDto {
    private Long id;
    private String name;
    private double price;
    private int quantity;
    private LocalDate expiryDate;
    private String divisionName;
}
