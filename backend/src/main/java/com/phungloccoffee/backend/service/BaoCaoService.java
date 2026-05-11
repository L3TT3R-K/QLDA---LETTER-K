package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.BaoCaoHaoHutResponse;
import com.phungloccoffee.backend.dto.BaoCaoTonKhoResponse;
import com.phungloccoffee.backend.dto.DoanhThuChiNhanhResponse;
import com.phungloccoffee.backend.dto.DoanhThuSanPhamResponse;
import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.entity.KiemKho;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.repository.CTHDRepository;
import com.phungloccoffee.backend.repository.CTKKRepository;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
import com.phungloccoffee.backend.repository.KiemKhoRepository;
import com.phungloccoffee.backend.repository.NguyenLieuRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BaoCaoService {
    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private CTHDRepository cthdRepository;

    @Autowired 
    private TonKhoRepository tonKhoRepository;
    @Autowired 
    private NguyenLieuRepository nguyenLieuRepository;
    @Autowired 
    private KiemKhoRepository kiemKhoRepository;
    @Autowired 
    private CTKKRepository ctkkRepository;
    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    public List<DoanhThuChiNhanhResponse> layDoanhThuChiNhanh(LocalDateTime tuNgay, LocalDateTime denNgay) {
        return hoaDonRepository.thongKeDoanhThuTheoChiNhanh(tuNgay, denNgay);
    }

    public List<DoanhThuSanPhamResponse> layDoanhThuSanPham(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay) {
        return cthdRepository.thongKeDoanhThuTheoSanPham(maCN, tuNgay, denNgay);
    }

    //Báo cáo tồn kho và cảnh báo
    public List<BaoCaoTonKhoResponse> layBaoCaoTonKho(String maCN) {
        //1. Lấy tất cả tồn kho của chi nhánh
        List<TonKho> danhSachTonKho = tonKhoRepository.findByMaCN(maCN);
        List<BaoCaoTonKhoResponse> ketQua = new ArrayList<>();

        //2. Duyệt từng dòng tồn kho để lấy tên nguyên liệu và so sánh mức tối thiểu
        for (TonKho tk : danhSachTonKho) {
            NguyenLieu nl = nguyenLieuRepository.findById(tk.getMaNL()).orElse(null);
            if (nl == null) continue;

            //Kiểm tra xem đã sắp hết hàng chưa
            String trangThai = "Bình thường";
            if (tk.getSoLuongTon() < nl.getTonToiThieu()) {
                trangThai = "Cần nhập hàng";
            }

            ketQua.add(BaoCaoTonKhoResponse.builder()
                .maCN(tk.getMaCN())
                .maNL(tk.getMaNL())
                .tenNL(nl.getTenNL())
                .soLuongTon(tk.getSoLuongTon())
                .tonToiThieu(nl.getTonToiThieu())
                .trangThai(trangThai)
                .build());
        }
        return ketQua;
    }

    public List<BaoCaoTonKhoResponse> layCanhBaoTonKho(String maCN) {
        List<TonKho> danhSachTonKho = isBlank(maCN) ? tonKhoRepository.findAll() : tonKhoRepository.findByMaCN(maCN);
        List<BaoCaoTonKhoResponse> ketQua = new ArrayList<>();

        for (TonKho tk : danhSachTonKho) {
            NguyenLieu nl = nguyenLieuRepository.findById(tk.getMaNL()).orElse(null);
            if (nl == null) continue;

            double soLuongTon = tk.getSoLuongTon() != null ? tk.getSoLuongTon() : 0.0;
            double tonToiThieu = nl.getTonToiThieu() != null ? nl.getTonToiThieu() : 0.0;

            if (soLuongTon < 0) {
                ketQua.add(BaoCaoTonKhoResponse.builder()
                    .maCN(tk.getMaCN())
                    .maNL(tk.getMaNL())
                    .tenNL(nl.getTenNL())
                    .soLuongTon(soLuongTon)
                    .tonToiThieu(tonToiThieu)
                    .trangThai("Tồn âm")
                    .loaiCanhBao("TON_AM")
                    .mucDo("NGHIEM_TRONG")
                    .thongDiep("Nguyên liệu đang bị tồn âm, cần kiểm tra giao dịch kho")
                    .build());
            } else if (soLuongTon < tonToiThieu) {
                ketQua.add(BaoCaoTonKhoResponse.builder()
                    .maCN(tk.getMaCN())
                    .maNL(tk.getMaNL())
                    .tenNL(nl.getTenNL())
                    .soLuongTon(soLuongTon)
                    .tonToiThieu(tonToiThieu)
                    .trangThai("Cần nhập hàng")
                    .loaiCanhBao("DUOI_TON_TOI_THIEU")
                    .mucDo("CANH_BAO")
                    .thongDiep("Nguyên liệu dưới mức tồn tối thiểu")
                    .build());
            }
        }

        return ketQua;
    }

    public List<InventoryTransaction> layGiaoDichDongBoLoi(String maCN) {
        return inventoryTransactionRepository.findCanhBaoDongBo(isBlank(maCN) ? null : maCN);
    }

    public Map<String, Object> layCanhBaoTongHop(String maCN) {
        List<BaoCaoTonKhoResponse> canhBaoTonKho = layCanhBaoTonKho(maCN);
        List<InventoryTransaction> giaoDichDongBoLoi = layGiaoDichDongBoLoi(maCN);

        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("canhBaoTonKho", canhBaoTonKho);
        ketQua.put("giaoDichDongBoLoi", giaoDichDongBoLoi);
        ketQua.put("soCanhBaoTonKho", canhBaoTonKho.size());
        ketQua.put("soGiaoDichDongBoLoi", giaoDichDongBoLoi.size());
        ketQua.put("tongCanhBao", canhBaoTonKho.size() + giaoDichDongBoLoi.size());
        return ketQua;
    }

    //Báo cáo hao hụt kiểm kho
    public List<BaoCaoHaoHutResponse> layBaoCaoHaoHut(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay) {
        //1. Tìm các phiếu kiểm kho trong thời gian đó
        List<KiemKho> danhSachPhieuKiem = kiemKhoRepository.findByChiNhanh_MaCNAndNgayKiemBetween(maCN, tuNgay, denNgay);
        List<BaoCaoHaoHutResponse> ketQua = new ArrayList<>();

        //2. Duyệt từng phiếu kiểm
        for (KiemKho phieu : danhSachPhieuKiem) {
            List<CTKK> chiTietKiem = ctkkRepository.findByMaKK(phieu.getMaKK());
            
            //3. Tính tỷ lệ hao hụt cho từng nguyên liệu trong phiếu đó
            for (CTKK ct : chiTietKiem) {
                NguyenLieu nl = nguyenLieuRepository.findById(ct.getMaNL()).orElse(null);
                String tenNL = (nl != null) ? nl.getTenNL() : "Không xác định";

                double tyLeHaoHut = 0.0;
                //Nếu chênh lệch âm (Thực tế < Hệ thống) => bị hao hụt
                if (ct.getChenhLech() < 0 && ct.getSoLuongHeThong() > 0) {
                    //Dùng Math.abs để chuyển số âm thành dương cho dễ nhìn %
                    tyLeHaoHut = (Math.abs(ct.getChenhLech()) / ct.getSoLuongHeThong()) * 100;
                }

                ketQua.add(BaoCaoHaoHutResponse.builder()
                    .maKK(phieu.getMaKK())
                    .ngayKiem(phieu.getNgayKiem())
                    .maNL(ct.getMaNL())
                    .tenNL(tenNL)
                    .soLuongHeThong(ct.getSoLuongHeThong())
                    .soLuongThucTe(ct.getSoLuongThucTe())
                    .chenhLech(ct.getChenhLech())
                    .tyLeHaoHut(Math.round(tyLeHaoHut * 100.0) / 100.0) //Làm tròn 2 chữ số
                    .build());
            }
        }
        return ketQua;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
