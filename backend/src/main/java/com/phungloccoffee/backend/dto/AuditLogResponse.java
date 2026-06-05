package com.phungloccoffee.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private String id;
    private LocalDateTime createdAt;
    private String username;
    private String action;
    private String module;
    private String details;
    private String type;
    private String maCN;
}