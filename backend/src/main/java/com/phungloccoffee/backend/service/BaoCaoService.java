package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.BaoCaoHaoHutResponse;
import com.phungloccoffee.backend.dto.BaoCaoTonKhoResponse;
import com.phungloccoffee.backend.dto.DoanhThuChiNhanhResponse;
import com.phungloccoffee.backend.dto.DoanhThuSanPhamResponse;
import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.KiemKho;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.repository.CTHDRepository;
import com.phungloccoffee.backend.repository.CTKKRepository;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import com.phungloccoffee.backend.repository.KiemKhoRepository;
import com.phungloccoffee.backend.repository.NguyenLieuRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
                .maNL(tk.getMaNL())
                .tenNL(nl.getTenNL())
                .soLuongTon(tk.getSoLuongTon())
                .tonToiThieu(nl.getTonToiThieu())
                .trangThai(trangThai)
                .build());
        }
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
}