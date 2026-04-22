package com.Product.Shop.Payload.Dto.OrderDto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemRequestDto {

@NotNull( message="ProductId is Required")
    private Long productId;
@Min(value=1,message="Qunatity must be at least 1")
    private int quantity;

    private double discount;
    private double gstPercentage;
}
