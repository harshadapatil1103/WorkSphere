package com.example.employeeapp.service;

import com.example.employeeapp.dto.RiskRequest;
import com.example.employeeapp.model.Employee;
import com.example.employeeapp.model.Project;
import com.example.employeeapp.model.Risk;
import com.example.employeeapp.model.SystemRole;
import com.example.employeeapp.repository.RiskRepository;
import com.example.employeeapp.security.CurrentUserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RiskService {

    private final RiskRepository riskRepository;
    private final ProjectService projectService;
    private final CurrentUserService currentUserService;

    public RiskService(RiskRepository riskRepository, ProjectService projectService,
                        CurrentUserService currentUserService) {
        this.riskRepository = riskRepository;
        this.projectService = projectService;
        this.currentUserService = currentUserService;
    }

    // Anyone who can view the project can view its risks
    public List<Risk> getRisksForProject(Long projectId) {
        projectService.getProjectById(projectId);
        return riskRepository.findByProjectId(projectId);
    }

    // Admin, the managing PM, AND any assigned Employee can raise a risk -
    // getProjectById already blocks employees who aren't on this project.
    public Risk createRisk(RiskRequest request) {
        Project project = projectService.getProjectById(request.getProjectId());
        Employee current = currentUserService.getCurrentEmployee();

        Risk risk = new Risk();
        risk.setProject(project);
        risk.setRaisedBy(current);
        applyRequest(risk, request);
        return riskRepository.save(risk);
    }

    public Risk updateRisk(Long id, RiskRequest request) {
        Risk risk = findRiskOrThrow(id);
        assertCanManage(risk);
        applyRequest(risk, request);
        return riskRepository.save(risk);
    }

    public void deleteRisk(Long id) {
        Risk risk = findRiskOrThrow(id);
        assertCanManage(risk);
        riskRepository.deleteById(id);
    }

    // Admin: any risk. PM: any risk on a project they manage.
    // Employee: only a risk they personally raised.
    private void assertCanManage(Risk risk) {
        Employee current = currentUserService.getCurrentEmployee();

        if (current.getSystemRole() == SystemRole.ADMIN) return;

        if (current.getSystemRole() == SystemRole.PROJECT_MANAGER
                && risk.getProject().getProjectManager() != null
                && risk.getProject().getProjectManager().getId().equals(current.getId())) {
            return;
        }

        if (risk.getRaisedBy() != null && risk.getRaisedBy().getId().equals(current.getId())) {
            return;
        }

        throw new AccessDeniedException("You can only manage risks you raised yourself");
    }

    private void applyRequest(Risk risk, RiskRequest request) {
        risk.setDescription(request.getDescription());
        if (request.getSeverity() != null) risk.setSeverity(request.getSeverity());
        if (request.getStatus() != null) risk.setStatus(request.getStatus());
    }

    private Risk findRiskOrThrow(Long id) {
        return riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + id));
    }
}
