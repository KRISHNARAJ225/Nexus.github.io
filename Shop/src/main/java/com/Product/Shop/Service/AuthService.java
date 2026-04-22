package com.Product.Shop.Service;

import com.Product.Shop.Payload.Dto.AuthDto.AuthResponseDto;
import com.Product.Shop.Payload.Dto.AuthDto.LoginRequest;
import com.Product.Shop.Payload.Dto.AuthDto.RegisterRequest;

public interface AuthService {
    AuthResponseDto register(RegisterRequest request);
    AuthResponseDto login(LoginRequest request);
    boolean validateToken(String token);
    void changePassword(String username, String currentPassword, String newPassword);
}
