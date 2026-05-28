package mth.controller;

import mth.models.Users;
import mth.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/authservice")
public class UsersController {

    @Autowired
    private UsersService usersService;

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Users user) {
        return usersService.signup(user);
    }

    @PostMapping("/signin")
    public Map<String, Object> signin(@RequestBody Map<String, Object> data) {
        return usersService.signin(data);
    }

    @GetMapping("/uinfo")
    public Map<String, Object> uinfo(@RequestHeader("Token") String token) {
        return usersService.uinfo(token);
    }
}
