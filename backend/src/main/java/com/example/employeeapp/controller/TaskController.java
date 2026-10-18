package com.example.employeeapp.controller;

import com.example.employeeapp.dto.TaskRequest;
import com.example.employeeapp.dto.TaskStatusUpdateRequest;
import com.example.employeeapp.model.Task;
import com.example.employeeapp.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // GET /api/projects/5/tasks - everyone who can view the project sees its tasks
    @GetMapping("/projects/{projectId}/tasks")
    public List<Task> getTasksForProject(@PathVariable Long projectId) {
        return taskService.getTasksForProject(projectId);
    }

    // GET /api/tasks/mine - "My Tasks", for any logged-in employee
    @GetMapping("/tasks/mine")
    public List<Task> getMyTasks() {
        return taskService.getMyTasks();
    }

    // POST /api/projects/5/tasks - Admin or the managing PM assigns a new task
    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<Task> createTask(@PathVariable Long projectId, @Valid @RequestBody TaskRequest request) {
        request.setProjectId(projectId);
        Task created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/tasks/9 - full edit (title, description, reassign) - Admin/managing PM only
    @PutMapping("/tasks/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    // PATCH /api/tasks/9/status - the assigned employee updates just their own status
    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusUpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, request));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
