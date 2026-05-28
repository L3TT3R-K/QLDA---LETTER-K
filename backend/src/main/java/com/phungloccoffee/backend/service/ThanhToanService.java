package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.dto.ThanhToanRequest;
import com.phungloccoffee.backend.dto.ThanhToanResponse;
import com.phungloccoffee.backend.entity.CTHD;
import com.phungloccoffee.backend.entity.DinhMucCongThuc;
import com.phungloccoffee.backend.entity.HoaDon;
import com.phungloccoffee.backend.entity.InventoryTransaction;
import com.phungloccoffee.backend.entity.PhienBanCongThuc;
import com.phungloccoffee.backend.entity.ThanhToan;
import com.phungloccoffee.backend.entity.TonKho;
import com.phungloccoffee.backend.repository.CTHDRepository;
import com.phungloccoffee.backend.repository.DinhMucCongThucRepository;
import com.phungloccoffee.backend.repository.HoaDonRepository;
import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
import com.phungloccoffee.backend.repository.PhienBanCongThucRepository;
import com.phungloccoffee.backend.repository.ThanhToanRepository;
import com.phungloccoffee.backend.repository.TonKhoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ThanhToanService {

  private static final Integer TRANG_THAI_THANH_CONG = 1;
  private static final Integer TRANG_THAI_HOP_LE = 1;
  private static final Integer LOAI_GIAO_DICH_XUAT = 2;
  private static final double EPSILON = 0.000001;

  private final ThanhToanRepository thanhToanRepository;
  private final HoaDonRepository hoaDonRepository;
  private final CTHDRepository cthdRepository;
  private final PhienBanCongThucRepository phienBanCongThucRepository;
  private final DinhMucCongThucRepository dinhMucCongThucRepository;
  private final TonKhoRepository tonKhoRepository;
  private final InventoryTransactionRepository inventoryTransactionRepository;

  @Transactional
  public ThanhToanResponse thanhToan(ThanhToanRequest request) {
    HoaDon hoaDon = hoaDonRepository.findById(request.getMaHD()).orElse(null);
    if (hoaDon == null) {
      return new ThanhToanResponse(null, null, null, null, "Khong tim thay hoa don");
    }

    ThanhToan thanhToan = new ThanhToan();
    String maTT = taoMaThanhToan();
    thanhToan.setMaTT(maTT);
    thanhToan.setHoaDon(hoaDon);
    thanhToan.setPhuongThuc(request.getPhuongThuc());
    thanhToan.setSoTien(request.getSoTien());
    thanhToan.setTrangThai(TRANG_THAI_THANH_CONG);
    thanhToan.setIsSynced(false);
    thanhToan.setCreatedAt(LocalDateTime.now());
    thanhToanRepository.save(thanhToan);

    hoaDon.setTrangThai(TRANG_THAI_THANH_CONG);
    hoaDonRepository.save(hoaDon);

    truKhoTheoHoaDon(hoaDon);
    return new ThanhToanResponse(maTT, hoaDon.getMaHD(), request.getSoTien(), request.getPhuongThuc(),
        "Thanh toan va tu dong tru kho thanh cong");
  }

  private void truKhoTheoHoaDon(HoaDon hoaDon) {
    String maCN = hoaDon.getChiNhanh().getMaCN();
    List<CTHD> danhSachMonMua = cthdRepository.findByHoaDon(hoaDon);

    for (CTHD monMua : danhSachMonMua) {
      String maSP = monMua.getSanPham().getMaSP();
      int soLuongMua = monMua.getSoLuong();

      PhienBanCongThuc congThuc = phienBanCongThucRepository
          .findByMaSPAndTrangThai(maSP, TRANG_THAI_THANH_CONG)
          .orElse(null);

      if (congThuc == null) {
        continue;
      }

      List<DinhMucCongThuc> danhSachNguyenLieu = dinhMucCongThucRepository.findByIdMaPB(congThuc.getMaPB());

      for (DinhMucCongThuc nguyenLieu : danhSachNguyenLieu) {
        String maNL = nguyenLieu.getId().getMaNL();
        double luongCanTru = soLuongMua * nguyenLieu.getSoLuong().doubleValue();

        TonKho tonKho = tonKhoRepository.findByMaCNAndMaNL(maCN, maNL);
        if (tonKho == null) {
          throw new IllegalStateException(String.format(
              "Không đủ tồn kho nguyên liệu %s tại chi nhánh %s. Tồn hiện tại: 0, cần trừ: %.2f",
              maNL, maCN, luongCanTru));
        }

        double tonHienTai = tonKho.getSoLuongTon() == null ? 0 : tonKho.getSoLuongTon();
        if (tonHienTai + EPSILON < luongCanTru) {
          throw new IllegalStateException(String.format(
              "Không đủ tồn kho nguyên liệu %s tại chi nhánh %s. Tồn hiện tại: %.2f, cần trừ: %.2f",
              maNL, maCN, tonHienTai, luongCanTru));
        }

        tonKho.setSoLuongTon(tonHienTai - luongCanTru);
        tonKhoRepository.save(tonKho);

        InventoryTransaction giaoDich = new InventoryTransaction();
        giaoDich.setMaTrans(taoMaGiaoDich(maCN));
        giaoDich.setMaCN(maCN);
        giaoDich.setMaNL(maNL);
        giaoDich.setSoLuong(luongCanTru);
        giaoDich.setLoaiChungTu("HOADON");
        giaoDich.setLoaiGiaoDich(LOAI_GIAO_DICH_XUAT);
        giaoDich.setIdChungTu(hoaDon.getMaHD());
        giaoDich.setTrangThai(TRANG_THAI_HOP_LE);
        giaoDich.setIsSynced(false);
        giaoDich.setCreatedAt(LocalDateTime.now());
        inventoryTransactionRepository.save(giaoDich);
      }
    }
  }

  private String taoMaThanhToan() {
    String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd_HHmmss"));
    int random = new Random().nextInt(900) + 100;
    return "TT_" + time + "_" + random;
  }

  private String taoMaGiaoDich(String maCN) {
    String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd_HHmmss"));
    int random = new Random().nextInt(9000) + 1000;
    return maCN + "_TR_" + time + "_" + random;
  }
}
