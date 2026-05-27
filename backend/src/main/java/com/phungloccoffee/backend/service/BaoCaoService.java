package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.BaoCaoHaoHutResponse;
import com.phungloccoffee.backend.dto.BaoCaoTonKhoResponse;
import com.phungloccoffee.backend.dto.CanhBaoTonKhoTongHopResponse;
import com.phungloccoffee.backend.dto.DoanhThuChiNhanhResponse;
import com.phungloccoffee.backend.dto.DoanhThuSanPhamResponse;
import com.phungloccoffee.backend.entity.CTKK;
import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.entity.KiemKho;
import com.phungloccoffee.backend.entity.NguyenLieu;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.repository.CTHDRepository;
import com.phungloccoffee.backend.repository.CTKKRepository;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
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
    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private CTHDRepository cthdRepository;
    @Autowired private TonKhoRepository tonKhoRepository;
    @Autowired private NguyenLieuRepository nguyenLieuRepository;
    @Autowired private ChiNhanhRepository chiNhanhRepository;
    @Autowired private KiemKhoRepository kiemKhoRepository;
    @Autowired private CTKKRepository ctkkRepository;
    @Autowired private InventoryTransactionRepository inventoryTransactionRepository;

    public List<DoanhThuChiNhanhResponse> layDoanhThuChiNhanh(LocalDateTime tuNgay, LocalDateTime denNgay) {
        return hoaDonRepository.thongKeDoanhThuTheoChiNhanh(tuNgay, denNgay);
    }

    public List<DoanhThuSanPhamResponse> layDoanhThuSanPham(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay) {
        return cthdRepository.thongKeDoanhThuTheoSanPham(maCN, tuNgay, denNgay);
    }

    public List<BaoCaoTonKhoResponse> layBaoCaoTonKho(String maCN) {
        List<TonKho> danhSachTonKho = isBlank(maCN) ? tonKhoRepository.findAll() : tonKhoRepository.findByMaCN(maCN);
        List<BaoCaoTonKhoResponse> ketQua = new ArrayList<>();

        for (TonKho tk : danhSachTonKho) {
            NguyenLieu nl = nguyenLieuRepository.findById(tk.getMaNL()).orElse(null);
            if (nl == null) continue;

            double soLuongTon = valueOrZero(tk.getSoLuongTon());
            double tonToiThieu = valueOrZero(nl.getTonToiThieu());
            String trangThai = "Bình thường";
            if (soLuongTon < 0) {
                trangThai = "Tồn âm";
            } else if (soLuongTon < tonToiThieu) {
                trangThai = "Cần nhập hàng";
            }

            ketQua.add(BaoCaoTonKhoResponse.builder()
                    .maCN(tk.getMaCN())
                    .maNL(tk.getMaNL())
                    .tenNL(nl.getTenNL())
                    .soLuongTon(soLuongTon)
                    .tonToiThieu(tonToiThieu)
                    .trangThai(trangThai)
                    .build());
        }
        return ketQua;
    }

    public List<BaoCaoTonKhoResponse> layCanhBaoTonKho(String maCN) {
        List<BaoCaoTonKhoResponse> ketQua = new ArrayList<>();
        ketQua.addAll(layTonAm(maCN));
        ketQua.addAll(layDuoiTonToiThieu(maCN));
        return ketQua;
    }

    public List<BaoCaoTonKhoResponse> layTonAm(String maCN) {
        List<TonKho> danhSachTonKho = isBlank(maCN) ? tonKhoRepository.findAll() : tonKhoRepository.findByMaCN(maCN);
        List<BaoCaoTonKhoResponse> ketQua = new ArrayList<>();

        for (TonKho tk : danhSachTonKho) {
            NguyenLieu nl = nguyenLieuRepository.findById(tk.getMaNL()).orElse(null);
            if (nl == null) continue;

            double soLuongTon = valueOrZero(tk.getSoLuongTon());
            if (soLuongTon < 0) {
                ketQua.add(taoCanhBaoTonKho(
                        tk.getMaCN(),
                        nl,
                        soLuongTon,
                        "Tồn âm",
                        "TON_AM",
                        "NGHIEM_TRONG",
                        "Nguyên liệu đang bị tồn âm, cần kiểm tra giao dịch kho"
                ));
            }
        }
        return ketQua;
    }

    public List<BaoCaoTonKhoResponse> layDuoiTonToiThieu(String maCN) {
        List<BaoCaoTonKhoResponse> ketQua = new ArrayList<>();
        List<ChiNhanh> danhSachChiNhanh = layChiNhanhCanKiemTra(maCN);
        List<NguyenLieu> danhSachNguyenLieu = nguyenLieuRepository.findAll();

        for (ChiNhanh chiNhanh : danhSachChiNhanh) {
            for (NguyenLieu nl : danhSachNguyenLieu) {
                TonKho tonKho = tonKhoRepository.findByMaCNAndMaNL(chiNhanh.getMaCN(), nl.getMaNL());
                double soLuongTon = tonKho != null ? valueOrZero(tonKho.getSoLuongTon()) : 0.0;
                double tonToiThieu = valueOrZero(nl.getTonToiThieu());

                if (soLuongTon >= 0 && soLuongTon < tonToiThieu) {
                    String thongDiep = tonKho == null
                            ? "Nguyên liệu chưa có bản ghi tồn kho tại chi nhánh"
                            : "Nguyên liệu dưới mức tồn tối thiểu";
                    ketQua.add(taoCanhBaoTonKho(
                            chiNhanh.getMaCN(),
                            nl,
                            soLuongTon,
                            "Cần nhập hàng",
                            "DUOI_TON_TOI_THIEU",
                            "CANH_BAO",
                            thongDiep
                    ));
                }
            }
        }
        return ketQua;
    }

    public List<InventoryTransaction> layGiaoDichDongBoLoi(String maCN) {
        return inventoryTransactionRepository.findCanhBaoDongBo(isBlank(maCN) ? null : maCN);
    }

    public CanhBaoTonKhoTongHopResponse layCanhBaoTongHop(String maCN) {
        List<BaoCaoTonKhoResponse> duoiTonToiThieu = layDuoiTonToiThieu(maCN);
        List<BaoCaoTonKhoResponse> tonAm = layTonAm(maCN);
        List<InventoryTransaction> giaoDichDongBoLoi = layGiaoDichDongBoLoi(maCN);

        return CanhBaoTonKhoTongHopResponse.builder()
                .duoiTonToiThieu(duoiTonToiThieu)
                .tonAm(tonAm)
                .giaoDichDongBoLoi(giaoDichDongBoLoi)
                .soDuoiTonToiThieu(duoiTonToiThieu.size())
                .soTonAm(tonAm.size())
                .soGiaoDichDongBoLoi(giaoDichDongBoLoi.size())
                .tongCanhBao(duoiTonToiThieu.size() + tonAm.size() + giaoDichDongBoLoi.size())
                .build();
    }

    public List<BaoCaoHaoHutResponse> layBaoCaoHaoHut(String maCN, LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<KiemKho> danhSachPhieuKiem = kiemKhoRepository.findByChiNhanh_MaCNAndNgayKiemBetween(maCN, tuNgay, denNgay);
        List<BaoCaoHaoHutResponse> ketQua = new ArrayList<>();

        for (KiemKho phieu : danhSachPhieuKiem) {
            List<CTKK> chiTietKiem = ctkkRepository.findByMaKK(phieu.getMaKK());

            for (CTKK ct : chiTietKiem) {
                NguyenLieu nl = nguyenLieuRepository.findById(ct.getMaNL()).orElse(null);
                String tenNL = nl != null ? nl.getTenNL() : "Không xác định";

                double tyLeHaoHut = 0.0;
                if (ct.getChenhLech() < 0 && ct.getSoLuongHeThong() > 0) {
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
                        .tyLeHaoHut(Math.round(tyLeHaoHut * 100.0) / 100.0)
                        .build());
            }
        }
        return ketQua;
    }

    private BaoCaoTonKhoResponse taoCanhBaoTonKho(String maCN, NguyenLieu nl, double soLuongTon,
                                                  String trangThai, String loaiCanhBao, String mucDo, String thongDiep) {
        return BaoCaoTonKhoResponse.builder()
                .maCN(maCN)
                .maNL(nl.getMaNL())
                .tenNL(nl.getTenNL())
                .soLuongTon(soLuongTon)
                .tonToiThieu(valueOrZero(nl.getTonToiThieu()))
                .trangThai(trangThai)
                .loaiCanhBao(loaiCanhBao)
                .mucDo(mucDo)
                .thongDiep(thongDiep)
                .build();
    }

    private List<ChiNhanh> layChiNhanhCanKiemTra(String maCN) {
        if (isBlank(maCN)) {
            return chiNhanhRepository.findAll();
        }
        return chiNhanhRepository.findById(maCN).map(List::of).orElse(List.of());
    }

    private double valueOrZero(Double value) {
        return value != null ? value : 0.0;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
