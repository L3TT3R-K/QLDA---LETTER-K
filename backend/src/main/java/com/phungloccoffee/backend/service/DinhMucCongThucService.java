package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.DinhMucCongThucRequest;
import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.entity.DinhMucCongThucId;
import com.phungloccoffee.backend.repository.DinhMucCongThucRepository;
import com.phungloccoffee.backend.repository.PhienBanCongThucRepository;
import com.phungloccoffee.backend.repository.NguyenLieuRepository; // Thêm repo này
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DinhMucCongThucService {

    private final DinhMucCongThucRepository dinhMucCongThucRepository;
    private final PhienBanCongThucRepository phienBanCongThucRepository;
    private final NguyenLieuRepository nguyenLieuRepository; // Inject để check tồn tại
    private final AuditLogService auditLogService; // Gắn thêm AuditLog

    public List<DinhMucCongThuc> getAll() {
        return dinhMucCongThucRepository.findAll();
    }

    public List<DinhMucCongThuc> getByMaPB(String maPB) {
        return dinhMucCongThucRepository.findByIdMaPB(maPB);
    }

    public DinhMucCongThuc getById(String maPB, String maNL) {
        DinhMucCongThucId id = new DinhMucCongThucId(maPB, maNL);
        return dinhMucCongThucRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy định mức công thức cho PB: " + maPB + " và NL: " + maNL));
    }

    @Transactional
    public DinhMucCongThuc create(DinhMucCongThucRequest request) {
        // 1. Kiểm tra Phiên bản tồn tại
        if (!phienBanCongThucRepository.existsById(request.getMaPB())) {
            throw new RuntimeException("Phiên bản công thức không tồn tại: " + request.getMaPB());
        }

        // 2. BỔ SUNG: Kiểm tra Nguyên liệu tồn tại (Quan trọng!)
        if (!nguyenLieuRepository.existsById(request.getMaNL())) {
            throw new RuntimeException("Nguyên liệu không tồn tại: " + request.getMaNL());
        }

        // 3. Kiểm tra số lượng hợp lệ
        if (request.getSoLuong() == null || request.getSoLuong().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số lượng nguyên liệu phải lớn hơn 0");
        }

        DinhMucCongThucId id = new DinhMucCongThucId(request.getMaPB(), request.getMaNL());

        // 4. Kiểm tra trùng lặp
        if (dinhMucCongThucRepository.existsById(id)) {
            throw new RuntimeException("Nguyên liệu này đã tồn tại trong công thức này rồi!");
        }

        DinhMucCongThuc dinhMuc = DinhMucCongThuc.builder()
                .id(id)
                .soLuong(request.getSoLuong())
                .build();

        DinhMucCongThuc saved = dinhMucCongThucRepository.save(dinhMuc);
        
        // 5. BỔ SUNG: Ghi log
        auditLogService.ghiLog("NV_ADMIN", "DINHMUCCONGTHUC", request.getMaPB() + "-" + request.getMaNL(), "INSERT", null, saved);
        
        return saved;
    }

    @Transactional
    public DinhMucCongThuc update(String maPB, String maNL, DinhMucCongThucRequest request) {
        DinhMucCongThuc dinhMuc = getById(maPB, maNL);
        
        // Lưu dữ liệu cũ để ghi log
        DinhMucCongThuc oldData = DinhMucCongThuc.builder()
                .id(new DinhMucCongThucId(dinhMuc.getId().getMaPB(), dinhMuc.getId().getMaNL()))
                .soLuong(dinhMuc.getSoLuong())
                .build();

        if (request.getSoLuong() == null || request.getSoLuong().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số lượng nguyên liệu phải lớn hơn 0");
        }

        dinhMuc.setSoLuong(request.getSoLuong());
        DinhMucCongThuc saved = dinhMucCongThucRepository.save(dinhMuc);
        
        // Ghi log update
        auditLogService.ghiLog("NV_ADMIN", "DINHMUCCONGTHUC", maPB + "-" + maNL, "UPDATE", oldData, saved);
        
        return saved;
    }

    @Transactional
    public void delete(String maPB, String maNL) {
        DinhMucCongThucId id = new DinhMucCongThucId(maPB, maNL);

        if (!dinhMucCongThucRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy định mức công thức để xóa");
        }

        dinhMucCongThucRepository.deleteById(id);
        
        // Ghi log delete
        auditLogService.ghiLog("NV_ADMIN", "DINHMUCCONGTHUC", maPB + "-" + maNL, "DELETE", null, null);
    }
}