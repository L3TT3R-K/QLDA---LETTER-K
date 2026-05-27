package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.repository.NguyenLieuRepository;
import com.phungloccoffee.backend.dto.NguyenLieuResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NguyenLieuService {
    private static final Integer HOAT_DONG = 1;
    private static final Integer NGUNG_HOAT_DONG = 0;

    @Autowired private NguyenLieuRepository repository;

    public List<NguyenLieuResponse> getAllNguyenLieu() {
        return repository.findAll().stream()
            .filter(nl -> !NGUNG_HOAT_DONG.equals(nl.getTrangThai()))
            .map(nl -> {
                NguyenLieuResponse dto = new NguyenLieuResponse();
                dto.setMaNL(nl.getMaNL());
                dto.setTenNL(nl.getTenNL());
                dto.setTonToiThieu(nl.getTonToiThieu());
                dto.setTrangThai(nl.getTrangThai());
                if (nl.getDonViCoBan() != null) {
                    dto.setTenDonVi(nl.getDonViCoBan().getTenDonVi());
                }
                return dto;
            }).collect(Collectors.toList());
    }

    public NguyenLieu createNguyenLieu(NguyenLieu nl) {
        nl.setMaNL("NL" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        nl.setTrangThai(HOAT_DONG);
        return repository.save(nl);
    }

    public NguyenLieu updateNguyenLieu(String maNL, NguyenLieu details) {
        Optional<NguyenLieu> optional = repository.findById(maNL);
        if (optional.isPresent()) {
            NguyenLieu existing = optional.get();
            existing.setTenNL(details.getTenNL());
            existing.setTonToiThieu(details.getTonToiThieu());
            existing.setTrangThai(details.getTrangThai());
            existing.setDonViCoBan(details.getDonViCoBan());
            return repository.save(existing);
        }
        return null;
    }

    public void deleteNguyenLieu(String maNL) {
        repository.findById(maNL).ifPresent(nl -> {
            nl.setTrangThai(NGUNG_HOAT_DONG);
            repository.save(nl);
        });
    }
}
