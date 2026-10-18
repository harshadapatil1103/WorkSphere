package com.example.employeeapp.dto;

import com.example.employeeapp.model.RiskSeverity;
import com.example.employeeapp.model.RiskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RiskRequest {

    @NotBlank(message = "Risk description is required")
    private String description;

    // Not validated here - always filled in by the controller from the URL
    // path (/projects/{projectId}/risks), never sent by the frontend itself.
    private Long projectId;

    private RiskSeverity severity;

    private RiskStatus status;
}
