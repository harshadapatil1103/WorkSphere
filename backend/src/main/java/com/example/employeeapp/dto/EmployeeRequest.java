package com.example.employeeapp.dto;

import com.example.employeeapp.model.SystemRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmployeeRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String roleInProject;

    // Defaults to EMPLOYEE if not provided - only Admin can set this, and
    // only Admin can hit this endpoint at all (enforced in the controller).
    private SystemRole systemRole = SystemRole.EMPLOYEE;
}
