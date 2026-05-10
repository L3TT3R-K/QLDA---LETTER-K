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

    @Transactional // Bảo đảm nguyên tắc: Chạy đúng 100% hoặc Rollback hủy bỏ toàn bộ
    public KiemKho luuPhieuKiemKho(KiemKho kiemKho, List<CTKK> danhSachChiTiet) {
        
        // 1. LƯU PHIẾU CHÍNH
        KiemKho savedKiemKho = kiemKhoRepository.save(kiemKho);
        String maCN = kiemKho.getChiNhanh().getMaCN(); // Lấy mã chi nhánh để lát nữa biết trừ kho ở đâu

        // 2. LƯU CHI TIẾT & TÍNH CHÊNH LỆCH
        for (CTKK chiTiet : danhSachChiTiet) {
            chiTiet.setMaKK(savedKiemKho.getMaKK());
            
            double heThong = chiTiet.getSoLuongHeThong() != null ? chiTiet.getSoLuongHeThong() : 0.0;
            double thucTe = chiTiet.getSoLuongThucTe() != null ? chiTiet.getSoLuongThucTe() : 0.0;
            double chenhLech = thucTe - heThong;
            chiTiet.setChenhLech(chenhLech);
            
            ctkkRepository.save(chiTiet);

            // 3. XỬ LÝ NGẦM: Nếu chênh lệch khác 0 thì phải trừ kho / cộng kho
            if (chenhLech != 0) {
                
                // --- BƯỚC 3.1: ĐÈ LÊN BẢNG TỒN KHO ---
                TonKho_ID tonKhoId = new TonKho_ID(maCN, chiTiet.getMaNL());
                // Tìm nguyên liệu trong kho, nếu chưa từng có thì tạo mới với số lượng tồn = 0
                TonKho tonKho = tonKhoRepository.findById(tonKhoId)
                        .orElse(new TonKho(maCN, chiTiet.getMaNL(), 0.0));
                
                // Lấy Tồn hiện tại + số Chênh lệch (nếu thiếu là số âm thì nó tự trừ)
                tonKho.setSoLuongTon(tonKho.getSoLuongTon() + chenhLech);
                tonKhoRepository.save(tonKho); // Chốt sổ số lượng mới

                // --- BƯỚC 3.2: GHI VÀO SỔ NHẬT KÝ GIAO DỊCH (TRANSACTION) ---
                InventoryTransaction trans = new InventoryTransaction();
                // Random 1 cái ID duy nhất không đụng hàng
                trans.setMaTrans("TR_" + UUID.randomUUID().toString().substring(0, 8)); 
                trans.setMaCN(maCN);
                trans.setMaNL(chiTiet.getMaNL());
                trans.setLoaiChungTu("KIEMKHO");
                trans.setIdChungTu(savedKiemKho.getMaKK());
                trans.setLoaiGiaoDich(0); // 0 = Giao dịch Điều chỉnh kiểm kho
                trans.setSoLuong(chenhLech); // Lưu đúng số lượng bị biến động
                trans.setTrangThai(1); // 1 = Hoàn thành
                trans.setIsSynced(false);
                trans.setCreatedAt(LocalDateTime.now());
                
                inventoryTransactionRepository.save(trans); // Lưu vết thành công
            }
        }

        return savedKiemKho;
    }
}