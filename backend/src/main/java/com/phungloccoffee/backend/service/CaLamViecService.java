package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.CaLamViec;
import com.phungloccoffee.backend.repository.CaLamViecRepository;
import com.phungloccoffee.backend.dto.CaLamViecResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CaLamViecService {
    private static final String NGUNG_HOAT_DONG = "Ngừng hoạt động";

    @Autowired
    private CaLamViecRepository repository;

    public List<CaLamViecResponse> getAllCaLamViec() {
        List<CaLamViec> danhSachCa = repository.findAll();
        
        return danhSachCa.stream().map(ca -> {
            CaLamViecResponse dto = new CaLamViecResponse();
            dto.setMaCa(ca.getMaCa());
            dto.setNgayLamViec(ca.getNgayLamViec());
            dto.setGioBatDau(ca.getGioBatDau());
            dto.setGioKetThuc(ca.getGioKetThuc());
            dto.setTrangThai(ca.getTrangThai());
            
            if (ca.getNhanVien() != null) {
                dto.setMaNV(ca.getNhanVien().getMaNV());
                dto.setTenNV(ca.getNhanVien().getTenNV());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public Optional<CaLamViec> getCaLamViecById(String maCa) {
        return repository.findById(maCa);
    }

    public CaLamViec createCaLamViec(CaLamViec caLamViec) {
        return repository.save(caLamViec);
    }

    public CaLamViec updateCaLamViec(String maCa, CaLamViec caLamViecDetails) {
        Optional<CaLamViec> optional = repository.findById(maCa);
        if (optional.isPresent()) {
            CaLamViec existing = optional.get();
            
            existing.setNgayLamViec(caLamViecDetails.getNgayLamViec());
            existing.setGioBatDau(caLamViecDetails.getGioBatDau());
            existing.setGioKetThuc(caLamViecDetails.getGioKetThuc());
            existing.setTrangThai(caLamViecDetails.getTrangThai());
            
            existing.setNhanVien(caLamViecDetails.getNhanVien());

            return repository.save(existing);
        }
        return null;
    }

    public void deleteCaLamViec(String maCa) {
        Optional<CaLamViec> optional = repository.findById(maCa);
        if (optional.isPresent()) {
            CaLamViec existing = optional.get();
            existing.setTrangThai(NGUNG_HOAT_DONG);
            repository.save(existing);
        }
    }
}
