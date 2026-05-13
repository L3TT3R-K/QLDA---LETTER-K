package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.NhaCungCapResponse;
import com.phungloccoffee.backend.entity.NhaCungCap;
import com.phungloccoffee.backend.repository.NhaCungCapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NhaCungCapService {
    private static final String HOAT_DONG = "Ho\u1EA1t \u0111\u1ED9ng";
    private static final String NGUNG_HOAT_DONG = "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng";

    @Autowired private NhaCungCapRepository repository;

    public List<NhaCungCapResponse> getAllNCC(String trangThai, boolean includeInactive) {
        return repository.findAll().stream()
                .filter(ncc -> includeInactive || !NGUNG_HOAT_DONG.equals(ncc.getTrangThai()))
                .filter(ncc -> isBlank(trangThai) || trangThai.trim().equalsIgnoreCase(ncc.getTrangThai()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NhaCungCapResponse getById(String maNCC) {
        return repository.findById(maNCC)
                .map(this::toResponse)
                .orElse(null);
    }

    public NhaCungCapResponse createNCC(NhaCungCap ncc) {
        if (ncc == null) {
            throw new IllegalArgumentException("Du lieu nha cung cap khong duoc de trong");
        }
        if (isBlank(ncc.getMaNCC())) {
            ncc.setMaNCC(generateMaNCC());
        } else {
            ncc.setMaNCC(ncc.getMaNCC().trim());
        }
        if (repository.existsById(ncc.getMaNCC())) {
            throw new IllegalArgumentException("Ma nha cung cap da ton tai: " + ncc.getMaNCC());
        }
        validate(ncc);
        ncc.setTrangThai(isBlank(ncc.getTrangThai()) ? HOAT_DONG : ncc.getTrangThai().trim());
        return toResponse(repository.save(ncc));
    }

    public NhaCungCapResponse updateNCC(String maNCC, NhaCungCap details) {
        if (details == null) {
            throw new IllegalArgumentException("Du lieu nha cung cap khong duoc de trong");
        }
        Optional<NhaCungCap> optional = repository.findById(maNCC);
        if (optional.isEmpty()) {
            return null;
        }

        NhaCungCap existing = optional.get();
        existing.setTenNCC(details.getTenNCC());
        existing.setSdt(details.getSdt());
        existing.setDiaChi(details.getDiaChi());
        if (!isBlank(details.getTrangThai())) {
            existing.setTrangThai(details.getTrangThai().trim());
        }
        validate(existing);
        return toResponse(repository.save(existing));
    }

    public boolean deleteNCC(String maNCC) {
        Optional<NhaCungCap> optional = repository.findById(maNCC);
        optional.ifPresent(ncc -> {
            ncc.setTrangThai(NGUNG_HOAT_DONG);
            repository.save(ncc);
        });
        return optional.isPresent();
    }

    private NhaCungCapResponse toResponse(NhaCungCap ncc) {
        return new NhaCungCapResponse(
                ncc.getMaNCC(),
                ncc.getTenNCC(),
                ncc.getSdt(),
                ncc.getDiaChi(),
                ncc.getTrangThai(),
                ncc.getCreatedAt(),
                ncc.getUpdatedAt()
        );
    }

    private void validate(NhaCungCap ncc) {
        if (isBlank(ncc.getTenNCC())) {
            throw new IllegalArgumentException("Ten nha cung cap khong duoc de trong");
        }
        ncc.setTenNCC(ncc.getTenNCC().trim());
        ncc.setSdt(trimToNull(ncc.getSdt()));
        ncc.setDiaChi(trimToNull(ncc.getDiaChi()));
    }

    private String generateMaNCC() {
        String maNCC;
        do {
            maNCC = "NCC" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        } while (repository.existsById(maNCC));
        return maNCC;
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
