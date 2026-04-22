package com.Product.Shop.Payload.Dto.OrderDto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequestDto {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Order items are required")
    @Valid
    private List<OrderItemRequestDto> orderItems;
}
