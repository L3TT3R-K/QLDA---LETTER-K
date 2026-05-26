package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.NhanVienRequest;
import com.phungloccoffee.backend.dto.NhanVienResponse;
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
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<NhanVienResponse> getAllNhanVien() {
        return nhanVienRepository.findAllCustom().stream().map(row -> 
            NhanVienResponse.builder()
                .maNV((String) row[0])
                .username((String) row[1])
                .tenNV((String) row[2])
                .chucVu((String) row[3])
                .tenChiNhanh((String) row[4])
                .trangThai((Integer) row[5])
                .build()
        ).toList();
    }


    public NhanVienResponse getEmployeeById(String maNV) {
        NhanVien nv = getById(maNV);
        return NhanVienResponse.builder()
                .maNV(nv.getMaNV())
                .username(nv.getUsername())
                .tenNV(nv.getTenNV())
                .chucVu(nv.getChucVu())
                .tenChiNhanh(nv.getMaCN()) 
                .trangThai(nv.getTrangThai())
                .build();
    }
    
    // --- GIỮ NGUYÊN CÁC HÀM XỬ LÝ LOGIC VÀ AUDIT LOG CỦA KHOA ---

    public NhanVien getById(String maNV) {
        return nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));
    }

    public NhanVien create(NhanVienRequest request) {
        if (nhanVienRepository.existsById(request.getMaNV())) {
            throw new RuntimeException("Mã nhân viên đã tồn tại!");
        }
        
        NhanVien nv = NhanVien.builder()
                .maNV(request.getMaNV())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword())) 
                .tenNV(request.getTenNV())
                .chucVu(request.getChucVu())
                .maCN(request.getMaCN())
                .trangThai(request.getTrangThai() != null ? request.getTrangThai() : 1)
                .build();

        NhanVien saved = nhanVienRepository.save(nv);
        
        // Audit log giữ nguyên Object truyền vào
        auditLogService.ghiLog("NV_ADMIN", "NHANVIEN", saved.getMaNV(), "INSERT", null, saved);
        
        return saved;
    }

    public NhanVien update(String maNV, NhanVienRequest request) {
        NhanVien nv = getById(maNV);

        // Lưu thông tin cũ để ghi log
        NhanVien oldData = NhanVien.builder()
                .maNV(nv.getMaNV()).username(nv.getUsername())
                .tenNV(nv.getTenNV()).chucVu(nv.getChucVu())
                .maCN(nv.getMaCN()).trangThai(nv.getTrangThai()).build();

        nv.setTenNV(request.getTenNV());
        nv.setChucVu(request.getChucVu());
        nv.setMaCN(request.getMaCN());
        nv.setTrangThai(request.getTrangThai());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            nv.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        NhanVien saved = nhanVienRepository.save(nv);
        auditLogService.ghiLog("NV_ADMIN", "NHANVIEN", maNV, "UPDATE", oldData, saved);
        
        return saved;
    }

    public void delete(String maNV) {
        NhanVien nv = getById(maNV);
        nv.setTrangThai(0); // Xóa mềm: cập nhật trạng thái về 0
        nhanVienRepository.save(nv);
        auditLogService.ghiLog("NV_ADMIN", "NHANVIEN", maNV, "DELETE (SOFT)", null, nv);
    }
}