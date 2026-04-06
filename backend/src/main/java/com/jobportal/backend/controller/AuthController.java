package com.jobportal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // Register: save user and return their ID + name
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        User saved = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());

        return ResponseEntity.ok(response);
    }

    // Login: verify credentials and return userId so the frontend can store it
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        User existing = userRepository.findByEmail(user.getEmail());

        Map<String, Object> response = new HashMap<>();

        if (existing == null) {
            response.put("message", "User not found");
            return ResponseEntity.status(404).body(response);
        }

        if (existing.getPassword() != null && existing.getPassword().equals(user.getPassword())) {
            // Return userId and name so the frontend can persist them in localStorage
            response.put("message", "Login Successful");
            response.put("userId", existing.getId());
            response.put("name", existing.getName());
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Wrong Password");
            return ResponseEntity.status(401).body(response);
        }
    }
}