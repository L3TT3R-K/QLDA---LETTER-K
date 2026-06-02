package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.NguyenLieuResponse;
import com.phungloccoffee.backend.entity.DonVi;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.repository.NguyenLieuRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NguyenLieuService {

    @Autowired 
    private NguyenLieuRepository repository;

    private void requireAdminAccess() {
        if (!SecurityUtils.canAccessAllBranches()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Admin mới có quyền thao tác danh mục Nguyên Liệu");
        }
    }

    public List<NguyenLieuResponse> getAllNguyenLieu() {
        List<Object[]> rows = repository.findAllCustom();
        List<NguyenLieuResponse> list = new ArrayList<>();
        
        for (Object[] row : rows) {
            NguyenLieuResponse dto = NguyenLieuResponse.builder()
                .maNL((String) row[0])
                .tenNL((String) row[1])
                .donViCoBan((String) row[2])
                .tonToiThieu(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                .trangThai(row[4] != null ? ((Number) row[4]).intValue() : 0)
                .build();
            list.add(dto);
        }
        return list;
    }

    public NguyenLieu createNguyenLieu(NguyenLieuResponse dto) {
        requireAdminAccess();
        NguyenLieu nl = new NguyenLieu();
        nl.setMaNL("NL" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        nl.setTenNL(dto.getTenNL());
        nl.setTonToiThieu(dto.getTonToiThieu());
        nl.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : 1);
        
        DonVi dv = new DonVi();
        dv.setMaDV(dto.getDonViCoBan()); 
        nl.setDonViCoBan(dv);
        
        return repository.save(nl);
    }

    public NguyenLieu updateNguyenLieu(String maNL, NguyenLieuResponse dto) {
        requireAdminAccess();
        Optional<NguyenLieu> optional = repository.findById(maNL);
        if (optional.isPresent()) {
            NguyenLieu existing = optional.get();
            existing.setTenNL(dto.getTenNL());
            existing.setTonToiThieu(dto.getTonToiThieu());
            existing.setTrangThai(dto.getTrangThai());
            
            DonVi dv = new DonVi();
            dv.setMaDV(dto.getDonViCoBan());
            existing.setDonViCoBan(dv);
            
            return repository.save(existing);
        }
        return null;
    }

    public void deleteNguyenLieu(String maNL) {
        requireAdminAccess();
        repository.findById(maNL).ifPresent(nl -> {
            nl.setTrangThai(0); 
            repository.save(nl);
        });
    }
}