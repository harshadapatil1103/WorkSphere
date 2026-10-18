package com.example.employeeapp.service;

import com.example.employeeapp.dto.EmployeeCreatedResponse;
import com.example.employeeapp.dto.EmployeeRequest;
import com.example.employeeapp.model.Employee;
import com.example.employeeapp.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;

@Service
public class EmployeeService {

    private static final String PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    // Creates a person AND their login account in one step, and hands back
    // a one-time temporary password for Admin to share with them.
    public EmployeeCreatedResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("An account with this email already exists");
        }

        String temporaryPassword = generateTemporaryPassword();

        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setRoleInProject(request.getRoleInProject());
        employee.setSystemRole(request.getSystemRole() != null ? request.getSystemRole()
                : com.example.employeeapp.model.SystemRole.EMPLOYEE);
        employee.setPassword(passwordEncoder.encode(temporaryPassword));

        Employee saved = employeeRepository.save(employee);
        return new EmployeeCreatedResponse(saved, temporaryPassword);
    }

    public Employee updateEmployee(Long id, EmployeeRequest request) {
        Employee existing = getEmployeeById(id);
        existing.setName(request.getName());
        existing.setEmail(request.getEmail());
        existing.setRoleInProject(request.getRoleInProject());
        if (request.getSystemRole() != null) {
            existing.setSystemRole(request.getSystemRole());
        }
        return employeeRepository.save(existing);
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(PASSWORD_CHARS.charAt(RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}
