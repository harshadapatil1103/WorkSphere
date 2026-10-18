package com.example.employeeapp.controller;

import com.example.employeeapp.dto.ProjectRequest;
import com.example.employeeapp.model.Project;
import com.example.employeeapp.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Filtered per-role inside the service: Employees only see their own projects
    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getVisibleProjects();
    }

    // Throws 403 inside the service if an Employee tries to view a project
    // they aren't assigned to
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    // Only Admin can create projects
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectRequest request) {
        Project created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Admin can edit any project; PM can edit only if they manage it
    // (enforced inside ProjectService.assertCanEdit)
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id,
                                                  @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    // Only Admin can delete projects
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // Admin or the managing PM can add someone to the team
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @PostMapping("/{id}/employees/{employeeId}")
    public ResponseEntity<Project> addEmployee(@PathVariable Long id, @PathVariable Long employeeId) {
        return ResponseEntity.ok(projectService.addEmployeeToProject(id, employeeId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @DeleteMapping("/{id}/employees/{employeeId}")
    public ResponseEntity<Project> removeEmployee(@PathVariable Long id, @PathVariable Long employeeId) {
        return ResponseEntity.ok(projectService.removeEmployeeFromProject(id, employeeId));
    }
}
