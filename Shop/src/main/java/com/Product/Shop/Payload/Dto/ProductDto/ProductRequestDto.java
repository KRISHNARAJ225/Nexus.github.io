package com.Product.Shop.Payload.Dto.ProductDto;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ProductRequestDto {
    @NotBlank(message = "Product name is required")
    private String name;

    @Positive(message = "Price must be greater than 0")
    private double price;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;

    private LocalDate expiryDate;
    @JsonProperty("saleableStock")
    private int saleableStock;
    @JsonProperty("nonSaleableStock")
    private int nonSaleableStock;
    private String sku;
    private String uom;
    @NotBlank(message = "Division name is required")
    private String divisionName;
}
