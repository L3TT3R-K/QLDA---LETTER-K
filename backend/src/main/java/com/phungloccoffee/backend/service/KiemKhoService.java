package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.CTKKRequest;
import com.phungloccoffee.backend.dto.KiemKhoChiTietResponse;
import com.phungloccoffee.backend.dto.KiemKhoRequest;
import com.phungloccoffee.backend.entity.*;
import com.phungloccoffee.backend.repository.CTKKRepository;
import com.phungloccoffee.backend.repository.KiemKhoRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import com.phungloccoffee.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KiemKhoService {

    private final KiemKhoRepository kiemKhoRepo;
    private final CTKKRepository ctkkRepo;
    private final TonKhoRepository tonKhoRepo;
    private final AuditLogService auditLogService; 
    public List<KiemKhoChiTietResponse> getAllLichSuKiemKho(String maCN) {
        String maCNHienTai = SecurityUtils.resolveInventoryBranch(maCN);
        List<Object[]> rows = maCNHienTai == null
                ? ctkkRepo.findAllChiTietKiemKho()
                : ctkkRepo.findAllChiTietKiemKhoByMaCN(maCNHienTai);
        List<KiemKhoChiTietResponse> list = new ArrayList<>();

        for (Object[] row : rows) {
            Double slHeThong = ((Number) row[5]).doubleValue();
            Double chenhLech = ((Number) row[7]).doubleValue();
            Double phanTram = (slHeThong == 0) ? 0.0 : (chenhLech / slHeThong) * 100;

            list.add(KiemKhoChiTietResponse.builder()
                    .maKK((String) row[0])
                    .ngayKiem(((Timestamp) row[1]).toLocalDateTime())
                    .maNL((String) row[2])
                    .tenNL((String) row[3])
                    .donVi((String) row[4])
                    .soLuongHeThong(slHeThong)
                    .soLuongThucTe(((Number) row[6]).doubleValue())
                    .chenhLech(chenhLech)
                    .phanTramSaiLech(Math.round(phanTram * 100.0) / 100.0) 
                    .maCN((String) row[11])
                    .tenChiNhanh((String) row[8])
                    .tenNhanVien((String) row[9])
                    .isSynced((Boolean) row[10])
                    .build());
        }
        return list;
    }

    @Transactional
    public void taoPhieuKiemKho(KiemKhoRequest request) {
        String maCN = SecurityUtils.resolveInventoryBranch(request.getMaCN());
        if (maCN == null || maCN.isBlank()) {
            throw new IllegalArgumentException("Ma chi nhanh khong duoc de trong");
        }

        KiemKho kk = new KiemKho();
        kk.setMaKK("KK" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        kk.setNgayKiem(LocalDateTime.now());
        kk.setIsSynced(request.getIsSynced());

        ChiNhanh cn = new ChiNhanh(); cn.setMaCN(maCN);
        kk.setChiNhanh(cn);

        NhanVien nv = new NhanVien(); nv.setMaNV(request.getMaNV());
        kk.setNhanVien(nv);

        kiemKhoRepo.save(kk);

        for (CTKKRequest chiTiet : request.getChiTiet()) {
            CTKK ct = new CTKK();
            ct.setMaKK(kk.getMaKK());
            ct.setMaNL(chiTiet.getMaNL());
            ct.setSoLuongHeThong(chiTiet.getSoLuongHeThong());
            ct.setSoLuongThucTe(chiTiet.getSoLuongThucTe());
            ct.setChenhLech(chiTiet.getChenhLech());
            ctkkRepo.save(ct);

            if (request.getIsSynced()) {
                TonKho_ID tkId = new TonKho_ID(maCN, chiTiet.getMaNL());
                TonKho tk = tonKhoRepo.findById(tkId).orElse(new TonKho(maCN, chiTiet.getMaNL(), 0.0));
                tk.setSoLuongTon(chiTiet.getSoLuongThucTe()); 
                tonKhoRepo.save(tk);
            }
        }
        auditLogService.ghiLog(null, "KIEMKHO", kk.getMaKK(), "TẠO MỚI", null, kk);
    }
}