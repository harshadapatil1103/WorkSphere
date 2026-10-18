package com.example.employeeapp.service;

import com.example.employeeapp.dto.ProjectRequest;
import com.example.employeeapp.model.Employee;
import com.example.employeeapp.model.Project;
import com.example.employeeapp.model.SystemRole;
import com.example.employeeapp.repository.EmployeeRepository;
import com.example.employeeapp.repository.ProjectRepository;
import com.example.employeeapp.security.CurrentUserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final CurrentUserService currentUserService;

    public ProjectService(ProjectRepository projectRepository, EmployeeRepository employeeRepository,
                           CurrentUserService currentUserService) {
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.currentUserService = currentUserService;
    }

    // ADMIN and PROJECT_MANAGER see every project. EMPLOYEE only sees
    // projects they've been assigned to as a team member.
    public List<Project> getVisibleProjects() {
        Employee current = currentUserService.getCurrentEmployee();

        if (current.getSystemRole() == SystemRole.EMPLOYEE) {
            return projectRepository.findAll().stream()
                    .filter(p -> p.getEmployees().stream().anyMatch(e -> e.getId().equals(current.getId())))
                    .toList();
        }
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        Project project = findProjectOrThrow(id);
        Employee current = currentUserService.getCurrentEmployee();

        if (current.getSystemRole() == SystemRole.EMPLOYEE && !isTeamMember(project, current)) {
            throw new AccessDeniedException("Not assigned to this project");
        }
        return project;
    }

    public Project createProject(ProjectRequest request) {
        // Only Admin can reach this - enforced with @PreAuthorize on the controller
        Project project = new Project();
        applyRequest(project, request);
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, ProjectRequest request) {
        Project project = findProjectOrThrow(id);
        assertCanEdit(project);
        applyRequest(project, request);
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        // Only Admin can reach this - enforced with @PreAuthorize on the controller
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    public Project addEmployeeToProject(Long projectId, Long employeeId) {
        Project project = findProjectOrThrow(projectId);
        assertCanEdit(project);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        boolean alreadyAssigned = project.getEmployees().stream()
                .anyMatch(e -> e.getId().equals(employee.getId()));

        if (!alreadyAssigned) {
            project.getEmployees().add(employee);
            projectRepository.save(project);
        }
        return project;
    }

    public Project removeEmployeeFromProject(Long projectId, Long employeeId) {
        Project project = findProjectOrThrow(projectId);
        assertCanEdit(project);
        project.getEmployees().removeIf(e -> e.getId().equals(employeeId));
        return projectRepository.save(project);
    }

    // Throws unless the current user is Admin, or the Project Manager
    // actually assigned to THIS project. Used for edit + team assignment.
    public void assertCanEdit(Project project) {
        Employee current = currentUserService.getCurrentEmployee();
        if (current.getSystemRole() == SystemRole.ADMIN) return;

        if (current.getSystemRole() == SystemRole.PROJECT_MANAGER
                && project.getProjectManager() != null
                && project.getProjectManager().getId().equals(current.getId())) {
            return;
        }
        throw new AccessDeniedException("You can only edit projects you manage");
    }

    private boolean isTeamMember(Project project, Employee employee) {
        return project.getEmployees().stream().anyMatch(e -> e.getId().equals(employee.getId()));
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    private void applyRequest(Project project, ProjectRequest request) {
        Employee manager = employeeRepository.findById(request.getProjectManagerId())
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found with id: " + request.getProjectManagerId()));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setProjectManager(manager);
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
    }
}
