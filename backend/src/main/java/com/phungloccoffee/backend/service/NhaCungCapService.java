package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.NhaCungCap;
import com.phungloccoffee.backend.repository.NhaCungCapRepository;
import com.phungloccoffee.backend.dto.NhaCungCapResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NhaCungCapService {
    @Autowired private NhaCungCapRepository repository;

    public List<NhaCungCapResponse> getAllNCC() {
        return repository.findAll().stream()
            .filter(ncc -> ncc.getTrangThai() != -1)
            .map(ncc -> new NhaCungCapResponse(ncc.getMaNCC(), ncc.getTenNCC(), ncc.getTrangThai()))
            .collect(Collectors.toList());
    }

    public NhaCungCap createNCC(NhaCungCap ncc) {
        ncc.setMaNCC("NCC" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        ncc.setTrangThai(1);
        return repository.save(ncc);
    }

    public NhaCungCap updateNCC(String maNCC, NhaCungCap details) {
        Optional<NhaCungCap> optional = repository.findById(maNCC);
        if (optional.isPresent()) {
            NhaCungCap existing = optional.get();
            existing.setTenNCC(details.getTenNCC());
            existing.setTrangThai(details.getTrangThai());
            return repository.save(existing);
        }
        return null;
    }

    public void deleteNCC(String maNCC) {
        repository.findById(maNCC).ifPresent(ncc -> {
            ncc.setTrangThai(-1);
            repository.save(ncc);
        });
    }
}