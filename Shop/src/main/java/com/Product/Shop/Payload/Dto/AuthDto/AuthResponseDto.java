package com.Product.Shop.Payload.Dto.AuthDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
 private String token;
 private String username;
 private String email;
 private String role;
 private String message;
}
