package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.NhanVienRequest;
import com.phungloccoffee.backend.dto.NhanVienResponse;
import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NhanVienService {

    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<NhanVienResponse> getAllNhanVien() {
        String maCN = SecurityUtils.getCurrentUserBranch(); 
        
        return nhanVienRepository.findAllCustomByMaCN(maCN).stream().map(row -> 
            NhanVienResponse.builder()
                .maNV((String) row[0])
                .username((String) row[1])
                .tenNV((String) row[2])
                .chucVu((String) row[3])
                .maCN((String) row[4])
                .tenChiNhanh((String) row[5])
                .trangThai((Integer) row[6])
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
                .maCN(nv.getMaCN())
                .tenChiNhanh(nv.getMaCN()) 
                .trangThai(nv.getTrangThai())
                .build();
    }
    
    public NhanVien getById(String maNV) {
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));
                
        if (!SecurityUtils.canAccessAllBranches()) {
            String currentMaCN = SecurityUtils.requireCurrentUserBranch();
            if (!currentMaCN.equals(nv.getMaCN())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền thao tác trên nhân viên chi nhánh khác");
            }
        }
        return nv;
    }

    public NhanVien create(NhanVienRequest request) {
        if (nhanVienRepository.existsById(request.getMaNV())) {
            throw new RuntimeException("Mã nhân viên đã tồn tại!");
        }
        
        if (!SecurityUtils.canAccessAllBranches()) {
             request.setMaCN(SecurityUtils.requireCurrentUserBranch());
             if (request.getChucVu().contains("ADMIN")) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Quản lý không được phép tạo tài khoản Admin");
             }
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
        
        String currentUser = SecurityUtils.requireCurrentUsername(); 
        auditLogService.ghiLog(currentUser, "NHANVIEN", saved.getMaNV(), "INSERT", null, saved);
        
        return saved;
    }

    public NhanVien update(String maNV, NhanVienRequest request) {
        NhanVien nv = getById(maNV); 


        if (!SecurityUtils.canAccessAllBranches() && (nv.getChucVu().contains("ADMIN") || request.getChucVu().contains("ADMIN"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không được phép sửa thông tin hoặc thăng cấp lên Admin");
        }

        NhanVien oldData = NhanVien.builder()
                .maNV(nv.getMaNV()).username(nv.getUsername())
                .tenNV(nv.getTenNV()).chucVu(nv.getChucVu())
                .maCN(nv.getMaCN()).trangThai(nv.getTrangThai()).build();

        nv.setTenNV(request.getTenNV());
        nv.setChucVu(request.getChucVu());

        if (SecurityUtils.canAccessAllBranches()) {
             nv.setMaCN(request.getMaCN()); 
        }
        nv.setTrangThai(request.getTrangThai());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            nv.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        NhanVien saved = nhanVienRepository.save(nv);
        
        String currentUser = SecurityUtils.requireCurrentUsername();
        auditLogService.ghiLog(currentUser, "NHANVIEN", maNV, "UPDATE", oldData, saved);
        
        return saved;
    }

    public void delete(String maNV) {
        NhanVien nv = getById(maNV); 
        
        if (!SecurityUtils.canAccessAllBranches() && nv.getChucVu().contains("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không được phép xóa tài khoản Admin");
        }
        
        nv.setTrangThai(0); 
        nhanVienRepository.save(nv);
        
        String currentUser = SecurityUtils.requireCurrentUsername();
        auditLogService.ghiLog(currentUser, "NHANVIEN", maNV, "DELETE (SOFT)", null, nv);
    }
}