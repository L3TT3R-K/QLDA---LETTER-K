// package com.phungloccoffee.backend.service;
// import java.time.LocalDateTime;
// import java.time.format.DateTimeFormatter;
// import java.util.List;
// import java.util.Random;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.phungloccoffee.backend.dto.ThanhToanRequest;
// import com.phungloccoffee.backend.dto.ThanhToanResponse;
// import com.phungloccoffee.backend.entity.CTHD;
// import com.phungloccoffee.backend.entity.DinhMucCongThuc;
// import com.phungloccoffee.backend.entity.HoaDon;
// import com.phungloccoffee.backend.entity.InventoryTransaction;
// import com.phungloccoffee.backend.entity.PhienBanCongThuc;
// import com.phungloccoffee.backend.entity.ThanhToan;
// import com.phungloccoffee.backend.entity.TonKho;
// import com.phungloccoffee.backend.repository.CTHDRepository;
// import com.phungloccoffee.backend.repository.DinhMucCongThucRepository;
// import com.phungloccoffee.backend.repository.HoaDonRepository;
// import com.phungloccoffee.backend.repository.InventoryTransactionRepository;
// import com.phungloccoffee.backend.repository.PhienBanCongThucRepository;
// import com.phungloccoffee.backend.repository.ThanhToanRepository;
// import com.phungloccoffee.backend.repository.TonKhoRepository;

// @Service
// public class ThanhToanService {
//     @Autowired private ThanhToanRepository thanhToanRepository;
//     @Autowired private HoaDonRepository hoaDonRepository;
//     @Autowired private CTHDRepository cthdRepository;
//     @Autowired private PhienBanCongThucRepository phienBanCongThucRepository;
//     @Autowired private DinhMucCongThucRepository dinhMucCongThucRepository;
//     @Autowired private TonKhoRepository tonKhoRepository;
//     @Autowired private InventoryTransactionRepository inventoryTransactionRepository;
//     @Transactional //@Transactional giúp hệ thống tự hoàn tác nếu có lỗi (tránh việc mất tiền mà không trừ kho)
//     public ThanhToanResponse thanhToan(ThanhToanRequest request) {
//         HoaDon hoaDon = hoaDonRepository.findById(request.getMaHD()).orElse(null);
//         if (hoaDon == null) {
//             return new ThanhToanResponse(null, null, null, null, "Không tìm thấy hóa đơn");
//         }
//         //1. Tạo và lưu thông tin Thanh Toán
//         ThanhToan thanhToan = new ThanhToan();
//         String maTT = taoMaThanhToan();
//         thanhToan.setMaTT(maTT);
//         thanhToan.setHoaDon(hoaDon);
//         thanhToan.setPhuongThuc(request.getPhuongThuc());
//         thanhToan.setSoTien(request.getSoTien());
//         thanhToan.setTrangThai("Thành công");
//         thanhToan.setIsSynced(false);
//         thanhToan.setCreatedAt(LocalDateTime.now());
//         thanhToanRepository.save(thanhToan);
//         //2. Cập nhật trạng thái Hóa đơn thành "Đã thanh toán"
//         hoaDon.setTrangThai("Đã thanh toán");
//         hoaDonRepository.save(hoaDon);
//         //3. GỌI HÀM TỰ ĐỘNG TRỪ KHO DƯỚI ĐÂY
//         truKhoTheoHoaDon(hoaDon);
//         return new ThanhToanResponse(maTT, hoaDon.getMaHD(), request.getSoTien(), request.getPhuongThuc(), "Thanh toán và tự động trừ kho thành công");
//     }

//     private void truKhoTheoHoaDon(HoaDon hoaDon) {
//         String maCN = hoaDon.getChiNhanh().getMaCN(); 
//         //1. Lấy danh sách các món khách đã mua trong hóa đơn này
//         List<CTHD> danhSachMonMua = cthdRepository.findByHoaDon(hoaDon);

//         for (CTHD monMua : danhSachMonMua) {
//             String maSP = monMua.getSanPham().getMaSP();
//             int soLuongMua = monMua.getSoLuong();
//             //2. Tìm "Phiên bản công thức" đang áp dụng của món này
//             PhienBanCongThuc congThuc = phienBanCongThucRepository
//                 .findByMaSPAndTrangThai(maSP, "Hoạt động")
//                 .orElse(null);

//             // Nếu món này không có công thức (VD: Nước suối đóng chai), bỏ qua để xét món tiếp theo
//             if (congThuc == null) {
//                 continue; 
//             }
//             //3. Lấy danh sách "Định mức nguyên liệu" bên trong công thức đó
//             List<DinhMucCongThuc> danhSachNguyenLieu = dinhMucCongThucRepository.findByIdMaPB(congThuc.getMaPB());

//             for (DinhMucCongThuc nguyenLieu : danhSachNguyenLieu) {
//                 String maNL = nguyenLieu.getId().getMaNL();

//                 //Tính tổng lượng nguyên liệu cần trừ = Số lượng mua * Định mức của 1 ly
//                 double luongCanTru = soLuongMua * nguyenLieu.getSoLuong().doubleValue();

//                 //4. Tìm bảng Tồn Kho hiện tại của Chi nhánh đó
//                 TonKho tonKho = tonKhoRepository.findByMaCNAndMaNL(maCN, maNL);
                
//                 if (tonKho == null) {
//                     //Nếu hệ thống chưa từng có nguyên liệu này, tạo mới và để số âm (nợ kho)
//                     tonKho = new TonKho();
//                     tonKho.setMaCN(maCN);
//                     tonKho.setMaNL(maNL);
//                     tonKho.setSoLuongTon(-luongCanTru);
//                 } else {
//                     //Nếu có rồi thì lấy Tồn kho hiện tại trừ đi lượng cần dùng
//                     tonKho.setSoLuongTon(tonKho.getSoLuongTon() - luongCanTru);
//                 }
//                 tonKhoRepository.save(tonKho);

//                 //5. Lưu lại Lịch sử giao dịch (Để đối soát kho sau này)
//                 InventoryTransaction giaoDich = new InventoryTransaction();
//                 giaoDich.setMaTrans(taoMaGiaoDich(maCN));
//                 giaoDich.setMaCN(maCN);
//                 giaoDich.setMaNL(maNL);
//                 giaoDich.setSoLuong(luongCanTru);
//                 giaoDich.setLoaiChungTu("HOADON");
//                 giaoDich.setLoaiGiaoDich("XUAT");
//                 giaoDich.setIdChungTu(hoaDon.getMaHD());
//                 giaoDich.setTrangThai("Hợp lệ");
//                 giaoDich.setIsSynced(false);
//                 giaoDich.setCreatedAt(LocalDateTime.now());
//                 inventoryTransactionRepository.save(giaoDich);
//             }
//         }
//     }
//     //Các hàm phụ trợ tạo mã ID
//     private String taoMaThanhToan() {
//         String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd_HHmmss"));
//         int random = new Random().nextInt(900) + 100;
//         return "TT_" + time + "_" + random;
//     }
//     private String taoMaGiaoDich(String maCN) {
//         String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd_HHmmss"));
//         int random = new Random().nextInt(9000) + 1000;
//         return maCN + "_TR_" + time + "_" + random;
//     }
// }
