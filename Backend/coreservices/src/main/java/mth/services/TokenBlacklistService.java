package mth.services;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {
    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();

    public void revoke(String token, Date expiration) {
        long expiresAt = expiration != null ? expiration.getTime() : System.currentTimeMillis() + 60_000L;
        revokedTokens.put(token, expiresAt);
        cleanupExpiredTokens();
    }

    public boolean isRevoked(String token) {
        cleanupExpiredTokens();
        Long expiresAt = revokedTokens.get(token);
        return expiresAt != null && expiresAt > System.currentTimeMillis();
    }

    private void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        Iterator<Map.Entry<String, Long>> iterator = revokedTokens.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Long> entry = iterator.next();
            if (entry.getValue() <= now) {
                iterator.remove();
            }
        }
    }
}
