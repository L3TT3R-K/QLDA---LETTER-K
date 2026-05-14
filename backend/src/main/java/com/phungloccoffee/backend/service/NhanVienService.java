package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.NhanVienRequest;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NhanVienService {

    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder; // Dùng để băm mật khẩu
    private final AuditLogService auditLogService;

    public List<NhanVien> getAll() {
        return nhanVienRepository.findAll();
    }

    public NhanVien getById(String maNV) {
        return nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));
    }

    public NhanVien create(NhanVienRequest request) {
        if (nhanVienRepository.existsById(request.getMaNV())) {
            throw new RuntimeException("Mã nhân viên đã tồn tại!");
        }
        if (nhanVienRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã có người sử dụng!");
        }

        NhanVien nv = NhanVien.builder()
                .maNV(request.getMaNV())
                .username(request.getUsername())
                // Mã hóa password ngay lập tức!
                .passwordHash(passwordEncoder.encode(request.getPassword())) 
                .tenNV(request.getTenNV())
                .chucVu(request.getChucVu())
                .maCN(request.getMaCN())
                .trangThai(request.getTrangThai() != null ? request.getTrangThai() : 1)
                .build();

        NhanVien saved = nhanVienRepository.save(nv);
        
        // Ẩn Password khi ghi log để bảo mật
        NhanVien logData = saved;
        logData.setPasswordHash("HIDDEN"); 
        auditLogService.ghiLog("NV_ADMIN", "NHANVIEN", saved.getMaNV(), "INSERT", null, logData);
        
        return saved;
    }

    public NhanVien update(String maNV, NhanVienRequest request) {
        NhanVien nv = getById(maNV);

        NhanVien oldData = NhanVien.builder()
                .maNV(nv.getMaNV()).username(nv.getUsername())
                .tenNV(nv.getTenNV()).chucVu(nv.getChucVu())
                .maCN(nv.getMaCN()).trangThai(nv.getTrangThai()).build();

        nv.setTenNV(request.getTenNV());
        nv.setChucVu(request.getChucVu());
        nv.setMaCN(request.getMaCN());
        nv.setTrangThai(request.getTrangThai());

        // Nếu FE có gửi password mới lên thì mới mã hóa lại, không thì giữ nguyên pass cũ
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            nv.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        NhanVien saved = nhanVienRepository.save(nv);
        
        oldData.setPasswordHash("HIDDEN");
        NhanVien logData = saved;
        logData.setPasswordHash("HIDDEN");
        auditLogService.ghiLog("NV_ADMIN", "NHANVIEN", maNV, "UPDATE", oldData, logData);
        
        return saved;
    }

    public void delete(String maNV) {
        NhanVien nv = getById(maNV);
        nv.setTrangThai(0); // Xóa mềm nghỉ việc
        nhanVienRepository.save(nv);
        auditLogService.ghiLog("NV_ADMIN", "NHANVIEN", maNV, "DELETE (SOFT)", null, nv);
    }
}