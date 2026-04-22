package com.Product.Shop.Payload.Dto.DivisionDto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DivisionRequestDto {
    @NotBlank(message = "Name is required")
    private String name;
}
