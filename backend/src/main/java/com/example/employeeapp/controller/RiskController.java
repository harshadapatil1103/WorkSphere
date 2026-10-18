package com.example.employeeapp.controller;

import com.example.employeeapp.dto.RiskRequest;
import com.example.employeeapp.model.Risk;
import com.example.employeeapp.service.RiskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RiskController {

    private final RiskService riskService;

    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    // GET /api/projects/5/risks
    @GetMapping("/projects/{projectId}/risks")
    public List<Risk> getRisksForProject(@PathVariable Long projectId) {
        return riskService.getRisksForProject(projectId);
    }

    // POST /api/projects/5/risks - Admin, managing PM, or any assigned Employee can raise one
    @PostMapping("/projects/{projectId}/risks")
    public ResponseEntity<Risk> createRisk(@PathVariable Long projectId, @Valid @RequestBody RiskRequest request) {
        request.setProjectId(projectId);
        Risk created = riskService.createRisk(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/risks/9 - Admin/managing PM can edit any risk; Employee only their own
    @PutMapping("/risks/{id}")
    public ResponseEntity<Risk> updateRisk(@PathVariable Long id, @Valid @RequestBody RiskRequest request) {
        return ResponseEntity.ok(riskService.updateRisk(id, request));
    }

    @DeleteMapping("/risks/{id}")
    public ResponseEntity<Void> deleteRisk(@PathVariable Long id) {
        riskService.deleteRisk(id);
        return ResponseEntity.noContent().build();
    }
}
