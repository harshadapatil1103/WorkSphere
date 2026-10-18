package com.example.employeeapp.dto;

import com.example.employeeapp.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    private LocalDate dueDate;

    // Not validated here - always filled in by the controller from the URL
    // path (/projects/{projectId}/tasks), never sent by the frontend itself.
    private Long projectId;

    private Long assignedToId;

    private TaskStatus status;
}
