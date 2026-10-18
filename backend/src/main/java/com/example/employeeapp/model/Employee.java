package com.example.employeeapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

// An Employee is now BOTH a person being managed AND a login account.
// This mirrors how real tools like Jira/Asana work - every "person" in
// the system is also a user who can log in.
@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true)
    private String email;

    // Job title / role on projects, e.g. "Frontend Developer", "QA Tester"
    // Purely descriptive - has no effect on permissions.
    private String roleInProject;

    // BCrypt hash. @JsonIgnore means this NEVER gets sent back in any API
    // response, even when an Employee is nested inside a Project - a
    // password hash accidentally leaking to the frontend is a real-world
    // security bug this annotation prevents.
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // Controls system-wide permissions - see SystemRole.java
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SystemRole systemRole = SystemRole.EMPLOYEE;
}
