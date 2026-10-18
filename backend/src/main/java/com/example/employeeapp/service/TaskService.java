package com.example.employeeapp.service;

import com.example.employeeapp.dto.TaskRequest;
import com.example.employeeapp.dto.TaskStatusUpdateRequest;
import com.example.employeeapp.model.Employee;
import com.example.employeeapp.model.Project;
import com.example.employeeapp.model.SystemRole;
import com.example.employeeapp.model.Task;
import com.example.employeeapp.repository.EmployeeRepository;
import com.example.employeeapp.repository.TaskRepository;
import com.example.employeeapp.security.CurrentUserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectService projectService;
    private final CurrentUserService currentUserService;

    public TaskService(TaskRepository taskRepository, EmployeeRepository employeeRepository,
                        ProjectService projectService, CurrentUserService currentUserService) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.projectService = projectService;
        this.currentUserService = currentUserService;
    }

    // Anyone who can VIEW the project (Admin, PM, or an assigned Employee)
    // can see its task list - getProjectById already throws 403 otherwise.
    public List<Task> getTasksForProject(Long projectId) {
        projectService.getProjectById(projectId);
        return taskRepository.findByProjectId(projectId);
    }

    // Tasks assigned to ME specifically - powers "My Tasks" for any role
    public List<Task> getMyTasks() {
        Employee current = currentUserService.getCurrentEmployee();
        return taskRepository.findByAssignedToId(current.getId());
    }

    // Only Admin, or the Project Manager who owns this project, may create a task
    public Task createTask(TaskRequest request) {
        Project project = projectService.getProjectById(request.getProjectId());
        projectService.assertCanEdit(project);

        Task task = new Task();
        task.setProject(project);
        applyRequest(task, request, project);
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = findTaskOrThrow(id);
        projectService.assertCanEdit(task.getProject());
        applyRequest(task, request, task.getProject());
        return taskRepository.save(task);
    }

    // The assigned Employee can update ONLY the status of their own task.
    // Admin/PM (managing the project) can also update status this way.
    public Task updateTaskStatus(Long id, TaskStatusUpdateRequest request) {
        Task task = findTaskOrThrow(id);
        Employee current = currentUserService.getCurrentEmployee();

        boolean isOwnTask = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(current.getId());
        boolean isManager = current.getSystemRole() == SystemRole.ADMIN
                || (current.getSystemRole() == SystemRole.PROJECT_MANAGER
                    && task.getProject().getProjectManager() != null
                    && task.getProject().getProjectManager().getId().equals(current.getId()));

        if (!isOwnTask && !isManager) {
            throw new AccessDeniedException("You can only update the status of your own tasks");
        }

        task.setStatus(request.getStatus());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        Task task = findTaskOrThrow(id);
        projectService.assertCanEdit(task.getProject());
        taskRepository.deleteById(id);
    }

    private void applyRequest(Task task, TaskRequest request, Project project) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        if (request.getAssignedToId() != null) {
            Employee assignee = employeeRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getAssignedToId()));

            boolean onTeam = project.getEmployees().stream().anyMatch(e -> e.getId().equals(assignee.getId()))
                    || (project.getProjectManager() != null && project.getProjectManager().getId().equals(assignee.getId()));
            if (!onTeam) {
                throw new RuntimeException("This employee is not on the project's team");
            }
            task.setAssignedTo(assignee);
        } else {
            task.setAssignedTo(null);
        }
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }
}
