package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.DongCaRequest;
import com.phungloccoffee.backend.dto.MoCaRequest;
import com.phungloccoffee.backend.entity.CaLamViec;
import com.phungloccoffee.backend.repository.CaLamViecRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CaLamViecService {

    private final CaLamViecRepository caLamViecRepository;
    private final AuditLogService auditLogService;

    public List<CaLamViec> getAll() {
        String maCN = SecurityUtils.getCurrentUserBranch();
        if (maCN == null) {
            return caLamViecRepository.findAll(); 
        }
        return caLamViecRepository.findByMaCN(maCN); 
    }

    public CaLamViec getById(String maCa) {
        CaLamViec caLamViec = caLamViecRepository.findById(maCa)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm việc: " + maCa));
        
        if (!SecurityUtils.canAccessAllBranches()) {
            String currentMaCN = SecurityUtils.requireCurrentUserBranch();
            if (!currentMaCN.equals(caLamViec.getMaCN())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập ca làm việc của chi nhánh khác");
            }
        }
        return caLamViec;
    }

    public CaLamViec moCa(MoCaRequest request) {
        if (caLamViecRepository.existsById(request.getMaCa())) {
            throw new RuntimeException("Mã ca đã tồn tại!");
        }

        if (!SecurityUtils.canAccessAllBranches()) {
            request.setMaCN(SecurityUtils.requireCurrentUserBranch());
            request.setMaNV(SecurityUtils.requireCurrentUsername()); 
        }

        CaLamViec caLamViec = CaLamViec.builder()
                .maCa(request.getMaCa())
                .maNV(request.getMaNV())
                .maCN(request.getMaCN())
                .tienDauCa(request.getTienDauCa())
                .thoiGianMo(LocalDateTime.now()) 
                .build();

        CaLamViec saved = caLamViecRepository.save(caLamViec);
        
        auditLogService.ghiLog(null, "CALAMVIEC", saved.getMaCa(), "MỞ CA", null, saved);
        return saved;
    }

    public CaLamViec dongCa(String maCa, DongCaRequest request) {
        CaLamViec caLamViec = getById(maCa); 

        if (caLamViec.getThoiGianDong() != null) {
            throw new RuntimeException("Ca làm việc này đã được đóng trước đó!");
        }

        CaLamViec oldData = CaLamViec.builder()
                .maCa(caLamViec.getMaCa()).maNV(caLamViec.getMaNV())
                .maCN(caLamViec.getMaCN()).thoiGianMo(caLamViec.getThoiGianMo()) 
                .tienDauCa(caLamViec.getTienDauCa()).build();

        caLamViec.setThoiGianDong(LocalDateTime.now());
        caLamViec.setTienCuoiCa(request.getTienCuoiCa());
        caLamViec.setSoTienThatThoat(request.getSoTienThatThoat());
        caLamViec.setLyDoGiaiTrinh(request.getLyDoGiaiTrinh());

        CaLamViec saved = caLamViecRepository.save(caLamViec);
        
        auditLogService.ghiLog(null, "CALAMVIEC", maCa, "ĐÓNG CA", oldData, saved);
        return saved;
    }
}