package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.entity.KiemKho;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.entity.TonKho_ID;
import com.phungloccoffee.backend.repository.CTKKRepository;
import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
import com.phungloccoffee.backend.repository.KiemKhoRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class KiemKhoService {

    @Autowired
    private KiemKhoRepository kiemKhoRepository;

    @Autowired
    private CTKKRepository ctkkRepository;

    @Autowired
    private TonKhoRepository tonKhoRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Transactional // Báº£o Ä‘áº£m nguyÃªn táº¯c: Cháº¡y Ä‘Ãºng 100% hoáº·c Rollback há»§y bá» toÃ n bá»™
    public KiemKho luuPhieuKiemKho(KiemKho kiemKho, List<CTKK> danhSachChiTiet) {
        
        // 1. LÆ¯U PHIáº¾U CHÃNH
        KiemKho savedKiemKho = kiemKhoRepository.save(kiemKho);
        String maCN = kiemKho.getChiNhanh().getMaCN(); // Láº¥y mÃ£ chi nhÃ¡nh Ä‘á»ƒ lÃ¡t ná»¯a biáº¿t trá»« kho á»Ÿ Ä‘Ã¢u

        // 2. LÆ¯U CHI TIáº¾T & TÃNH CHÃŠNH Lá»†CH
        for (CTKK chiTiet : danhSachChiTiet) {
            chiTiet.setMaKK(savedKiemKho.getMaKK());
            
            double heThong = chiTiet.getSoLuongHeThong() != null ? chiTiet.getSoLuongHeThong() : 0.0;
            double thucTe = chiTiet.getSoLuongThucTe() != null ? chiTiet.getSoLuongThucTe() : 0.0;
            double chenhLech = thucTe - heThong;
            chiTiet.setChenhLech(chenhLech);
            
            ctkkRepository.save(chiTiet);

            // 3. Xá»¬ LÃ NGáº¦M: Náº¿u chÃªnh lá»‡ch khÃ¡c 0 thÃ¬ pháº£i trá»« kho / cá»™ng kho
            if (chenhLech != 0) {
                
                // --- BÆ¯á»šC 3.1: ÄÃˆ LÃŠN Báº¢NG Tá»’N KHO ---
                TonKho_ID tonKhoId = new TonKho_ID(maCN, chiTiet.getMaNL());
                // TÃ¬m nguyÃªn liá»‡u trong kho, náº¿u chÆ°a tá»«ng cÃ³ thÃ¬ táº¡o má»›i vá»›i sá»‘ lÆ°á»£ng tá»“n = 0
                TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                        .orElse(new TonKho(maCN, chiTiet.getMaNL(), 0.0));
                
                // Láº¥y Tá»“n hiá»‡n táº¡i + sá»‘ ChÃªnh lá»‡ch (náº¿u thiáº¿u lÃ  sá»‘ Ã¢m thÃ¬ nÃ³ tá»± trá»«)
                tonKho.setSoLuongTon(tonKho.getSoLuongTon() + chenhLech);
                tonKhoRepository.save(tonKho); // Chá»‘t sá»• sá»‘ lÆ°á»£ng má»›i

                // --- BÆ¯á»šC 3.2: GHI VÃ€O Sá»” NHáº¬T KÃ GIAO Dá»ŠCH (TRANSACTION) ---
                InventoryTransaction trans = new InventoryTransaction();
                // Random 1 cÃ¡i ID duy nháº¥t khÃ´ng Ä‘á»¥ng hÃ ng
                trans.setMaTrans("TR_" + UUID.randomUUID().toString().substring(0, 8)); 
                trans.setMaCN(maCN);
                trans.setMaNL(chiTiet.getMaNL());
                trans.setLoaiChungTu("KIEMKHO");
                trans.setIdChungTu(savedKiemKho.getMaKK());
                trans.setLoaiGiaoDich(chenhLech > 0 ? 3 : 4);
                trans.setSoLuong(Math.abs(chenhLech));
                trans.setTrangThai(1);
                trans.setIsSynced(false);
                trans.setCreatedAt(LocalDateTime.now());
                
                inventoryTransactionRepository.save(trans); // LÆ°u váº¿t thÃ nh cÃ´ng
            }
        }

        return savedKiemKho;
    }
}
