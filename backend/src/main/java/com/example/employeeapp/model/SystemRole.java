package com.example.employeeapp.model;

// Controls what a logged-in person is allowed to do across the whole app.
// This is DIFFERENT from "roleInProject" on Employee, which is just a
// job title like "Frontend Developer" - purely descriptive, no permissions.
public enum SystemRole {
    ADMIN,
    PROJECT_MANAGER,
    EMPLOYEE
}
