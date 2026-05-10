package com.phungloccoffee.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phungloccoffee.backend.dto.ApiResponse;
import com.phungloccoffee.backend.dto.ChiTietBillResponse;
import com.phungloccoffee.backend.dto.HoaDonRequest;
import com.phungloccoffee.backend.service.HoaDonService;

@RestController
@RequestMapping("/api/hoadon")
public class HoaDonController {
    @Autowired
    private HoaDonService hoaDonService;

    //Chức năng: Tạo hóa đơn mới khi bấm nút thanh toán trên POS
    @PostMapping
    public ResponseEntity<ApiResponse<ChiTietBillResponse>> taoHoaDon(@RequestBody HoaDonRequest request) {
        //Gọi Service xử lý logic (tính tiền, lưu DB) và nhận về dữ liệu bill
        ChiTietBillResponse duLieuBill = hoaDonService.taoHoaDon(request);
        //Tạo vỏ bọc phản hồi ApiResponse để gửi về cho Frontend
        ApiResponse<ChiTietBillResponse> phanHoi = new ApiResponse<>();
        phanHoi.setStatus(200); // 200 là mã thành công
        phanHoi.setMessage("Đã tạo hóa đơn và tính tiền thành công");
        phanHoi.setData(duLieuBill);
        //Trả về trình duyệt/máy POS với trạng thái OK (200)
        return ResponseEntity.ok(phanHoi);
    }

    // Chức năng: Xem lại chi tiết một hóa đơn dựa vào Mã HD
    @GetMapping("/{maHD}")
    public ResponseEntity<ApiResponse<ChiTietBillResponse>> xemChiTiet(@PathVariable String maHD) {
        ChiTietBillResponse duLieu = hoaDonService.getChiTietHoaDon(maHD);
        //Kiểm tra nếu không tìm thấy dữ liệu
        if (duLieu == null) {
            ApiResponse<ChiTietBillResponse> loi = new ApiResponse<>();
            loi.setStatus(404); // 404 là mã không tìm thấy
            loi.setMessage("Không tìm thấy hóa đơn mã: " + maHD);
            return ResponseEntity.status(404).body(loi);
        }
        //Nếu tìm thấy thì đóng gói và trả về
        ApiResponse<ChiTietBillResponse> phanHoi = new ApiResponse<>();
        phanHoi.setStatus(200);
        phanHoi.setMessage("Lấy chi tiết hóa đơn thành công");
        phanHoi.setData(duLieu);
        return ResponseEntity.ok(phanHoi);
    }
}