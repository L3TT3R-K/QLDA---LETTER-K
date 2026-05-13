package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.DonVi;
import com.phungloccoffee.backend.repository.DonViRepository;
import com.phungloccoffee.backend.dto.DonViResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DonViService {
    private static final String HOAT_DONG = "Hoạt động";
    private static final String NGUNG_HOAT_DONG = "Ngừng hoạt động";

    @Autowired private DonViRepository repository;

    public List<DonViResponse> getAllDonVi() {
        return repository.findAll().stream()
            .filter(dv -> !NGUNG_HOAT_DONG.equals(dv.getTrangThai()))
            .map(dv -> new DonViResponse(dv.getMaDV(), dv.getTenDonVi(), dv.getTrangThai()))
            .collect(Collectors.toList());
    }

    public DonVi createDonVi(DonVi donVi) {
        if (donVi.getMaDV() == null) {
            donVi.setMaDV("DV" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        }
        donVi.setTrangThai(HOAT_DONG);
        return repository.save(donVi);
    }

    public DonVi updateDonVi(String maDV, DonVi details) {
        Optional<DonVi> optional = repository.findById(maDV);
        if (optional.isPresent()) {
            DonVi existing = optional.get();
            existing.setTenDonVi(details.getTenDonVi());
            existing.setTrangThai(details.getTrangThai());
            return repository.save(existing);
        }
        return null;
    }

    public void deleteDonVi(String maDV) {
        repository.findById(maDV).ifPresent(dv -> {
            dv.setTrangThai(NGUNG_HOAT_DONG);
            repository.save(dv);
        });
    }
}
