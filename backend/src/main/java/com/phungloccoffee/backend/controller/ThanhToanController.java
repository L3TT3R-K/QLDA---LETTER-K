// package com.phungloccoffee.backend.controller;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.phungloccoffee.backend.dto.ApiResponse;
// import com.phungloccoffee.backend.dto.ThanhToanRequest;
// import com.phungloccoffee.backend.dto.ThanhToanResponse;
// import com.phungloccoffee.backend.service.ThanhToanService;

// @RestController
// @RequestMapping("/api/thanhtoan")
// public class ThanhToanController {
//     @Autowired
//     private ThanhToanService thanhToanService;
//     //Chức năng: Xác nhận đã nhận tiền của khách (Tiền mặt/Chuyển khoản)
//     @PostMapping
//     public ResponseEntity<ApiResponse<ThanhToanResponse>> xacNhanThanhToan(@RequestBody ThanhToanRequest request) {
//         //Gọi Service để cập nhật trạng thái hóa đơn thành "Đã thanh toán"
//         ThanhToanResponse ketQua = thanhToanService.thanhToan(request);
//         //Tạo vỏ bọc phản hồi
//         ApiResponse<ThanhToanResponse> phanHoi = new ApiResponse<>();
//         //Kiểm tra logic từ Service (Ví dụ: Service trả về null nếu sai mã HD)
//         if (ketQua.getMaTT() == null) {
//             phanHoi.setStatus(400); // 400 là lỗi dữ liệu gửi lên sai
//             phanHoi.setMessage(ketQua.getMessage()); // Hiển thị lỗi "Không tìm thấy HD"
//             return ResponseEntity.status(400).body(phanHoi);
//         }
//         //Đóng gói dữ liệu thành công
//         phanHoi.setStatus(200);
//         phanHoi.setMessage("Giao dịch thanh toán đã được lưu!");
//         phanHoi.setData(ketQua);
//         return ResponseEntity.ok(phanHoi);
//     }
// }