package com.Product.Shop.Payload.Dto.StockDto;

import lombok.Data;

@Data
public class StockRespnseDto {
    private Long id;
    private Long productId;
    private int quantity;
    private boolean isDeleted;
    private String type;

}
