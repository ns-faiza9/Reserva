package mth.services;

import mth.models.Users;
import mth.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UsersService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private JwtService jwtService;

    public Map<String, Object> signup(Users user) {
        Map<String, Object> response = new HashMap<>();
        if (usersRepository.checkByEmail(user.getEmail()) != null) {
            response.put("code", 501);
            response.put("message", "Email already registered");
            return response;
        }
        user.setRole(1);
        user.setStatus(1);
        if (user.getPhone() == null) user.setPhone("");
        usersRepository.save(user);
        response.put("code", 200);
        response.put("message", "Account created");
        return response;
    }

    public Map<String, Object> signin(Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        Object role = usersRepository.validateCredentials(
                data.get("username").toString(), data.get("password").toString());
        if (role == null) {
            response.put("code", 404);
            response.put("message", "Invalid credentials");
            return response;
        }
        response.put("code", 200);
        response.put("jwt", jwtService.generateJWT(data.get("username"), role));
        return response;
    }

    public Map<String, Object> uinfo(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = jwtService.validateJWT(token);
            Users user = usersRepository.findByEmail((String) payload.get("username"));
            response.put("code", 200);
            response.put("id", user.getId());
            response.put("fullname", user.getFullname());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("role", user.getRole());
            response.put("status", user.getStatus());
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }
}
