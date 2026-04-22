package com.Product.Shop.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Product.Shop.Payload.Dto.DivisionDto.DivisionRequestDto;
import com.Product.Shop.Payload.Response.ApiResponse;
import com.Product.Shop.Service.DivisionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/divisions")
@RequiredArgsConstructor
public class DivisionController {

    @Autowired
    private DivisionService service;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllDivisions(
            @RequestParam(required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Success", service.listAll(search, page, size, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getDivision(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Success", service.get(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> addDivision(@Valid @RequestBody DivisionRequestDto division) {
        return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Success", service.save(division)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateDivision(@PathVariable Long id, @Valid @RequestBody DivisionRequestDto division) {
        return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Success", service.update(id, division)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteDivision(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Division deleted successfully", null));
    }
}
