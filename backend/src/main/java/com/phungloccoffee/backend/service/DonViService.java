package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.DonViRequest;
import com.phungloccoffee.backend.entity.DonVi;
import com.phungloccoffee.backend.repository.DonViRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonViService {
    private final DonViRepository donViRepository;
    private final AuditLogService auditLogService;

    public List<DonVi> getAll() { return donViRepository.findAll(); }

    public DonVi getById(String maDV) {
        return donViRepository.findById(maDV).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị!"));
    }

    public DonVi create(DonViRequest request) {
        if(donViRepository.existsById(request.getMaDV())) throw new RuntimeException("Mã đơn vị đã tồn tại!");
        DonVi donVi = DonVi.builder().maDV(request.getMaDV()).tenDonVi(request.getTenDonVi()).trangThai(request.getTrangThai()).build();
        DonVi saved = donViRepository.save(donVi);
        auditLogService.ghiLog("NV_ADMIN", "DONVI", saved.getMaDV(), "INSERT", null, saved);
        return saved;
    }

    public void delete(String maDV) {
        DonVi dv = getById(maDV);
        dv.setTrangThai(0);
        donViRepository.save(dv);
        auditLogService.ghiLog("NV_ADMIN", "DONVI", maDV, "DELETE (SOFT)", null, dv);
    }
}