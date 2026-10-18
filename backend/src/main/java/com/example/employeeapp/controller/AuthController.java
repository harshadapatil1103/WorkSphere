package com.example.employeeapp.controller;

import com.example.employeeapp.dto.AuthDtos.LoginRequest;
import com.example.employeeapp.dto.AuthDtos.LoginResponse;
import com.example.employeeapp.model.Employee;
import com.example.employeeapp.repository.EmployeeRepository;
import com.example.employeeapp.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/auth/login  { "email": "admin@company.com", "password": "admin123" }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(employee.getEmail());
        return ResponseEntity.ok(new LoginResponse(
                token, employee.getName(), employee.getEmail(), employee.getSystemRole()));
    }
}
