package com.Product.Shop.Service;

import org.springframework.data.domain.Page;

import com.Product.Shop.Payload.Dto.StockDto.StockRequestDto;
import com.Product.Shop.Payload.Dto.StockDto.StockRespnseDto;

public interface StockService {
    StockRespnseDto addStock(StockRequestDto dto);
    StockRespnseDto getAvailableStock(Long productId);
    Page<StockRespnseDto> listAll(String search, String type, Long productId, int page, int size, String sortBy, String sortDir);
}
