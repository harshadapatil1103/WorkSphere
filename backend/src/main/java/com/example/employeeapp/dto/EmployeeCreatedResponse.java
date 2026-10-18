package com.example.employeeapp.dto;

import com.example.employeeapp.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Data;

// Only returned ONCE, immediately after account creation. This is the only
// place the plaintext temporary password ever appears - it is never stored
// anywhere and can't be retrieved again (Admin must reset it if lost).
@Data
@AllArgsConstructor
public class EmployeeCreatedResponse {
    private Employee employee;
    private String temporaryPassword;
}
