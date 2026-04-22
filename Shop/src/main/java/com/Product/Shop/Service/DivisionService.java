package com.Product.Shop.Service;

import org.springframework.data.domain.Page;

import com.Product.Shop.Payload.Dto.DivisionDto.DivisionRequestDto;
import com.Product.Shop.Payload.Dto.DivisionDto.DivisionResponseDto;

public interface DivisionService {
    Page<DivisionResponseDto> listAll(String search, int page, int size, String sortBy, String sortDir);
    DivisionResponseDto get(Long id);
    DivisionResponseDto save(DivisionRequestDto division);
    DivisionResponseDto update(Long id, DivisionRequestDto division);
    void delete(Long id);
}
