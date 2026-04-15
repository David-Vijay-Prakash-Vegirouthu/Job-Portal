package com.jobportal.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String testApi() {
        return "Backend is working!";
    }
}
