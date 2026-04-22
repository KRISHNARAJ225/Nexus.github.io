package com.Product.Shop.Service.ServiceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.Product.Shop.Model.Division;
import com.Product.Shop.Payload.Dto.DivisionDto.DivisionRequestDto;
import com.Product.Shop.Payload.Dto.DivisionDto.DivisionResponseDto;
import com.Product.Shop.Repository.DivisionRepository;
import com.Product.Shop.Service.DivisionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DivisionServiceImpl implements DivisionService {

    private final DivisionRepository repository;

    @Override
    public Page<DivisionResponseDto> listAll(String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return repository.searchAndFilter(search, pageable).map(this::mapToDto);
    }

    @Override
    public DivisionResponseDto get(Long id) {
        return mapToDto(repository.findById(id).orElseThrow(() -> new RuntimeException("Division Not Found")));
    }

    @Override
    public DivisionResponseDto save(DivisionRequestDto division) {
        Division d = new Division();
        d.setName(division.getName());
        return mapToDto(repository.save(d));
    }

    @Override
    public DivisionResponseDto update(Long id, DivisionRequestDto division) {
        Division existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Division Not Found"));
        existing.setName(division.getName());
        return mapToDto(repository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Division existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Division Not Found"));
        existing.setDeleted(true);
        repository.save(existing);
    }

    private DivisionResponseDto mapToDto(Division division) {
        DivisionResponseDto dto = new DivisionResponseDto();
        dto.setId(division.getId());
        dto.setName(division.getName());
        return dto;
    }
}
