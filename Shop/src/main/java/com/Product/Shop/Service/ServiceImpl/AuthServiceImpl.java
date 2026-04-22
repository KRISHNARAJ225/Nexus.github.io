package com.Product.Shop.Service.ServiceImpl;

import java.time.LocalDateTime;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.Product.Shop.Model.Login;
import com.Product.Shop.Payload.Dto.AuthDto.AuthResponseDto;
import com.Product.Shop.Payload.Dto.AuthDto.LoginRequest;
import com.Product.Shop.Payload.Dto.AuthDto.RegisterRequest;
import com.Product.Shop.Repository.LoginRepository;
import com.Product.Shop.Service.AuthService;
import com.Product.Shop.Util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final LoginRepository loginRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public AuthResponseDto register(RegisterRequest request) {
        if (loginRepository.existsByUsername(request.getUsername())) {
            return new AuthResponseDto(null, null, null, null, "Username already exists");
        }
        if (loginRepository.existsByEmail(request.getEmail())) {
            return new AuthResponseDto(null, null, null, null, "Email already exists");
        }

        Login login = new Login();
        login.setUsername(request.getUsername());
        login.setPassword(passwordEncoder.encode(request.getPassword()));
        login.setEmail(request.getEmail());
        login.setActive(true);
        login.setCreatedAt(LocalDateTime.now());

        loginRepository.save(login);

        String token = jwtUtil.generateToken(login.getUsername());

        return new AuthResponseDto(token, login.getUsername(), login.getEmail(), login.getRole(), "Registration successful");
    }

    @Override
    public AuthResponseDto login(LoginRequest request) {
        Login login = loginRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), login.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!login.isActive()) {
            throw new RuntimeException("Account is inactive");
        }

        login.setLastLogin(LocalDateTime.now());
        loginRepository.save(login);

        String token = jwtUtil.generateToken(login.getUsername());

        return new AuthResponseDto(token, login.getUsername(), login.getEmail(), login.getRole(), "Login successful");
    }

    @Override
    public boolean validateToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            return jwtUtil.validateToken(token, username);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void changePassword(String username, String currentPassword, String newPassword) {
        Login login = loginRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, login.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        login.setPassword(passwordEncoder.encode(newPassword));
        loginRepository.save(login);
    }
}
