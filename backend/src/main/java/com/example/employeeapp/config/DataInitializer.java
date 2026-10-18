package com.example.employeeapp.config;

import com.example.employeeapp.model.Employee;
import com.example.employeeapp.model.SystemRole;
import com.example.employeeapp.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Runs once when the backend starts. If no Admin exists yet, creates one
// so you have something to log in with immediately.
// Default login -> email: admin@company.com / password: admin123
@Component
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (employeeRepository.findByEmail("admin@company.com").isEmpty()) {
            Employee admin = new Employee();
            admin.setName("Admin");
            admin.setEmail("admin@company.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setSystemRole(SystemRole.ADMIN);
            admin.setRoleInProject("System Administrator");
            employeeRepository.save(admin);
            System.out.println("Created default admin -> email: admin@company.com / password: admin123");
        }
    }
}
