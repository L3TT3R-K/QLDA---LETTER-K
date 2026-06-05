package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.NhaCungCapResponse;
import com.phungloccoffee.backend.entity.NhaCungCap;
import com.phungloccoffee.backend.repository.NhaCungCapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NhaCungCapService {
    private static final Integer HOAT_DONG = 1;
    private static final Integer NGUNG_HOAT_DONG = 0;

    @Autowired private NhaCungCapRepository repository;
    @Autowired private AuditLogService auditLogService; 

    public List<NhaCungCapResponse> getAllNCC(String trangThai, boolean includeInactive) {
        return repository.findAll().stream()
                .filter(ncc -> includeInactive || !NGUNG_HOAT_DONG.equals(ncc.getTrangThai()))
                .filter(ncc -> isBlank(trangThai) || parseTrangThai(trangThai).equals(ncc.getTrangThai()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NhaCungCapResponse getById(String maNCC) {
        return repository.findById(maNCC)
                .map(this::toResponse)
                .orElse(null);
    }

    public NhaCungCapResponse createNCC(NhaCungCap ncc) {
        if (ncc == null) {
            throw new IllegalArgumentException("Du lieu nha cung cap khong duoc de trong");
        }
        if (isBlank(ncc.getMaNCC())) {
            ncc.setMaNCC(generateMaNCC());
        } else {
            ncc.setMaNCC(ncc.getMaNCC().trim());
        }
        if (repository.existsById(ncc.getMaNCC())) {
            throw new IllegalArgumentException("Ma nha cung cap da ton tai: " + ncc.getMaNCC());
        }
        validate(ncc);
        ncc.setTrangThai(ncc.getTrangThai() == null ? HOAT_DONG : ncc.getTrangThai());
        
        NhaCungCap saved = repository.save(ncc);
        auditLogService.ghiLog(null, "NHACUNGCAP", saved.getMaNCC(), "TẠO MỚI", null, saved);
        return toResponse(saved);
    }

    public NhaCungCapResponse updateNCC(String maNCC, NhaCungCap details) {
        if (details == null) {
            throw new IllegalArgumentException("Du lieu nha cung cap khong duoc de trong");
        }
        Optional<NhaCungCap> optional = repository.findById(maNCC);
        if (optional.isEmpty()) {
            return null;
        }

        NhaCungCap existing = optional.get();
        existing.setTenNCC(details.getTenNCC());
        existing.setSdt(details.getSdt());
        existing.setDiaChi(details.getDiaChi());
        if (details.getTrangThai() != null) {
            existing.setTrangThai(details.getTrangThai());
        }
        validate(existing);
        
        NhaCungCap saved = repository.save(existing);
        auditLogService.ghiLog(null, "NHACUNGCAP", maNCC, "CẬP NHẬT", null, saved);
        return toResponse(saved);
    }

    public boolean deleteNCC(String maNCC) {
        Optional<NhaCungCap> optional = repository.findById(maNCC);
        optional.ifPresent(ncc -> {
            ncc.setTrangThai(NGUNG_HOAT_DONG);
            NhaCungCap saved = repository.save(ncc);
            auditLogService.ghiLog(null, "NHACUNGCAP", maNCC, "XÓA", null, saved);
        });
        return optional.isPresent();
    }

    private NhaCungCapResponse toResponse(NhaCungCap ncc) {
        return new NhaCungCapResponse(
                ncc.getMaNCC(),
                ncc.getTenNCC(),
                ncc.getSdt(),
                ncc.getDiaChi(),
                ncc.getTrangThai(),
                ncc.getCreatedAt(),
                ncc.getUpdatedAt()
        );
    }

    private void validate(NhaCungCap ncc) {
        if (isBlank(ncc.getTenNCC())) {
            throw new IllegalArgumentException("Ten nha cung cap khong duoc de trong");
        }
        ncc.setTenNCC(ncc.getTenNCC().trim());
        ncc.setSdt(trimToNull(ncc.getSdt()));
        ncc.setDiaChi(trimToNull(ncc.getDiaChi()));
    }

    private String generateMaNCC() {
        String maNCC;
        do {
            maNCC = "NCC" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        } while (repository.existsById(maNCC));
        return maNCC;
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private Integer parseTrangThai(String value) {
        return Integer.valueOf(value.trim());
    }
}