package com.example.employeeapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Project name is required")
    @Column(nullable = false)
    private String name;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    // PLANNED, ACTIVE, or COMPLETED
    private String status = "PLANNED";

    // The manager is one specific Employee, picked from the shared employee pool
    @ManyToOne
    @JoinColumn(name = "project_manager_id")
    @NotNull(message = "Project manager is required")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Employee projectManager;

    // Many employees can be on many projects -> needs a join table (project_employees)
    @ManyToMany
    @JoinTable(
        name = "project_employees",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<Employee> employees = new ArrayList<>();
}
