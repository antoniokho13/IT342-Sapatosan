package edu.cit.sapatosan.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/welcome")
    public String adminWelcome() {
        return "Welcome, Admin!";
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/users/welcome")
    public String userWelcome() {
        return "Welcome, User!";
    }
}
