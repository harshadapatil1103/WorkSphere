package com.example.employeeapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// This is the file you "Run" to start the whole backend server.
@SpringBootApplication
public class EmployeeappApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeappApplication.class, args);
        System.out.println("Employee Management backend is running on http://localhost:8080");
    }

}
