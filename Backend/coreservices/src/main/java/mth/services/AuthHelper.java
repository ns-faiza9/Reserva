package mth.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthHelper {

    @Autowired
    private JwtService jwtService;

    public String emailFromToken(String token) {
        try {
            return jwtService.validateJWT(token).get("username").toString();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
    }

    public int roleFromToken(String token) {
        try {
            return ((Number) jwtService.validateJWT(token).get("role")).intValue();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
    }

    public void requireAdmin(String token) {
        if (roleFromToken(token) != 2) {
            throw new RuntimeException("Admin access required");
        }
    }
}
