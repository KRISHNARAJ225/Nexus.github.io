package com.Product.Shop.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.Product.Shop.Payload.Dto.AuthDto.AuthResponseDto;
import com.Product.Shop.Payload.Dto.AuthDto.LoginRequest;
import com.Product.Shop.Payload.Dto.AuthDto.RegisterRequest;
import com.Product.Shop.Payload.Response.ApiResponse;
import com.Product.Shop.Service.AuthService;
import com.Product.Shop.Util.JwtUtil;
import java.util.Map;
import com.Product.Shop.Payload.Response.ApiResponse;
import com.Product.Shop.Service.AuthService;

@RestController
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/api/v1/auth/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestHeader(value = "Authorization", required = false) String token, @RequestBody Map<String, String> request) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(), "Invalid or missing token", null));
            }
            String jwtToken = token.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(jwtToken);
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            authService.changePassword(username, currentPassword, newPassword);
            return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Password changed successfully", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage(), false));
        }
    }

    @PostMapping("/api/v1/auth/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponseDto response = authService.register(request);
            if (response.getToken() == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(HttpStatus.BAD_REQUEST.value(), response.getMessage(), null));
            }
            return ResponseEntity.ok(new ApiResponse(HttpStatus.CREATED.value(), "Registration Successfull", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null));
        }
    }

    @PostMapping("/api/v1/auth/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponseDto response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Login Successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(), e.getMessage(), null));
        }
    }

    @GetMapping("/api/v1/token/validate")
    public ResponseEntity<ApiResponse> validateToken(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(), "Authorization header is missing", false));
            }
            if (!token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(), "Invalid token format. Expected 'Bearer <token>'", false));
            }
            String jwtToken = token.replace("Bearer ", "");
            boolean valid = authService.validateToken(jwtToken);
            if (valid) {
                return ResponseEntity.ok(new ApiResponse(HttpStatus.OK.value(), "Token is Valid", true));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(), "Invalid Token", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(), "Invalid Token", false));
        }
    }
}
