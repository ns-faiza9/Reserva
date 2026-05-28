package mth.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    private final String secret = "ReservaDBDFinalProjectSecretKey2026SecureTokenSigning";
    private final SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());

    public String generateJWT(Object username, Object role) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", username);
        payload.put("role", role);
        return Jwts.builder()
                .claims(payload)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }

    public Map<String, Object> validateJWT(String token) throws Exception {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        Date expiration = claims.getExpiration();
        if (expiration == null || expiration.before(new Date())) {
            throw new Exception("Token expired");
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", claims.get("username"));
        payload.put("role", claims.get("role"));
        return payload;
    }
}
