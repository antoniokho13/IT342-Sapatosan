package edu.cit.sapatosan.service;

import edu.cit.sapatosan.dto.LoginRequest;
import edu.cit.sapatosan.dto.LoginResponse;
import edu.cit.sapatosan.dto.LogoutRequest;
import edu.cit.sapatosan.entity.UserEntity;
import edu.cit.sapatosan.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.ExecutionException;

@Service
public class AuthService {

    private final UserService userService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserService userService,
                       TokenBlacklistService tokenBlacklistService,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            UserEntity user = userService.getAllUsers().get().stream()
                    .filter(u -> u.getEmail().equals(request.getEmail()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid password");
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
            return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Error fetching user from Firebase", e);
        }
    }

    public void logout(LogoutRequest request) {
        String token = request.getToken();
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Token is required for logout");
        }

        Date expirationDate = jwtUtil.extractExpiration(token);
        tokenBlacklistService.addTokenToBlacklist(token, expirationDate.getTime());
    }
}