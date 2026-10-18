package com.example.employeeapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "risks")
@Data
@NoArgsConstructor
public class Risk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Risk description is required")
    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskStatus status = RiskStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskSeverity severity = RiskSeverity.MEDIUM;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    // Who raised this risk - used to let an Employee manage their OWN risks
    @ManyToOne
    @JoinColumn(name = "raised_by_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Employee raisedBy;
}
