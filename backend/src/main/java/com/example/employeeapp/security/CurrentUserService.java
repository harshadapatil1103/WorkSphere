package com.example.employeeapp.security;

import com.example.employeeapp.model.Employee;
import com.example.employeeapp.repository.EmployeeRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

// Any Service/Controller can call currentUserService.getCurrentEmployee()
// to find out "who is making this request right now" - used everywhere we
// need to check ownership, e.g. "is this Project Manager the manager of
// THIS specific project?"
@Service
public class CurrentUserService {

    private final EmployeeRepository employeeRepository;

    public CurrentUserService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee getCurrentEmployee() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user no longer exists"));
    }
}
