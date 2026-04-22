package com.Product.Shop.Service.ServiceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.Product.Shop.Model.Product;
import com.Product.Shop.Model.Stock;
import com.Product.Shop.Payload.Dto.StockDto.StockRequestDto;
import com.Product.Shop.Payload.Dto.StockDto.StockRespnseDto;
import com.Product.Shop.Repository.OrderItemRepository;
import com.Product.Shop.Repository.ProductRepository;
import com.Product.Shop.Repository.StockRepository;
import com.Product.Shop.Service.StockService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Page<StockRespnseDto> listAll(String search, String type, Long productId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return stockRepository.searchAndFilter(search, type, productId, PageRequest.of(page, size, sort)).map(this::mapToDto);
    }

    @Override
    public StockRespnseDto addStock(StockRequestDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        Stock stock = new Stock();
        stock.setProduct(product);
        stock.setQuantity(dto.getQuantity());
        stock.setType(dto.getType());

        Stock saved = stockRepository.save(stock);

        if ("IN".equalsIgnoreCase(dto.getType())) {
            product.setQuantity(product.getQuantity() + dto.getQuantity());
        } else if ("OUT".equalsIgnoreCase(dto.getType())) {
            int newQty = product.getQuantity() - dto.getQuantity();
            if (newQty < 0) throw new RuntimeException("Insufficient stock for product: " + product.getName());
            product.setQuantity(newQty);
        }
        productRepository.save(product);

        return mapToDto(saved);
    }

    @Override
    public StockRespnseDto getAvailableStock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        int orderQuantity = orderItemRepository.getTotalQuantityByProductId(productId);
        int availableStock = Math.max(product.getQuantity() - orderQuantity, 0);

        StockRespnseDto dto = new StockRespnseDto();
        dto.setProductId(productId);
        dto.setQuantity(availableStock);
        dto.setType("AVAILABLE");
        return dto;
    }

    private StockRespnseDto mapToDto(Stock stock) {
        StockRespnseDto dto = new StockRespnseDto();
        dto.setId(stock.getId());
        dto.setProductId(stock.getProduct().getId());
        dto.setQuantity(stock.getQuantity());
        dto.setDeleted(stock.isDeleted());
        dto.setType(stock.getType());
        return dto;
    }
}
