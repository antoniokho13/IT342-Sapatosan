package edu.cit.sapatosan.service;

import edu.cit.sapatosan.dto.LoginRequest;
import edu.cit.sapatosan.dto.LoginResponse;
import edu.cit.sapatosan.dto.LogoutRequest;
import edu.cit.sapatosan.entity.TokenBlacklist;
import edu.cit.sapatosan.repository.TokenBlacklistRepository;
import edu.cit.sapatosan.entity.UserEntity;
import edu.cit.sapatosan.repository.UserRepository;
import edu.cit.sapatosan.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository,
                       UserService userService,
                       TokenBlacklistRepository tokenBlacklistRepository, // Add this line
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.tokenBlacklistRepository = tokenBlacklistRepository; // Add this line
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());
    }

    public void logout(LogoutRequest request) {
        String token = request.getToken();
        Date expirationDate = jwtUtil.extractExpiration(token);

        TokenBlacklist tokenBlacklist = new TokenBlacklist();
        tokenBlacklist.setToken(token);
        tokenBlacklist.setExpirationDate(expirationDate);

        tokenBlacklistRepository.save(tokenBlacklist);
    }
}