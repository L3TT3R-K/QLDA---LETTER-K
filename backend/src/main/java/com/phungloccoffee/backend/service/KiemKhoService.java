package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.KiemKho;
import com.phungloccoffee.backend.repository.CTKKRepository;
import com.phungloccoffee.backend.repository.KiemKhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class KiemKhoService {

    @Autowired
    private KiemKhoRepository kiemKhoRepository;

    @Autowired
    private CTKKRepository ctkkRepository;

    @Transactional
    public KiemKho luuPhieuKiemKho(KiemKho kiemKho, List<CTKK> danhSachChiTiet) {

        KiemKho savedKiemKho = kiemKhoRepository.save(kiemKho);

        for (CTKK chiTiet : danhSachChiTiet) {
            chiTiet.setMaKK(savedKiemKho.getMaKK());

            double heThong = chiTiet.getSoLuongHeThong() != null ? chiTiet.getSoLuongHeThong() : 0.0;
            double thucTe = chiTiet.getSoLuongThucTe() != null ? chiTiet.getSoLuongThucTe() : 0.0;
            
            double chenhLech = thucTe - heThong;
            chiTiet.setChenhLech(chenhLech);

            ctkkRepository.save(chiTiet);

            if (chenhLech != 0) {
                System.out.println("PHÁT HIỆN LỆCH KHO: Nguyên liệu " + chiTiet.getMaNL() 
                                   + " | Lệch: " + chenhLech);
            }
        }

        return savedKiemKho;
    }
}