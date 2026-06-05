package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.dto.AuditLogResponse;
import com.phungloccoffee.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }
}