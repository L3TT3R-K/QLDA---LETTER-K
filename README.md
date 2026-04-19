# HỆ THỐNG QUẢN LÝ CHUỖI CỬA HÀNG CÀ PHÊ

## Mã đồ án
**ITPJ2601**

## Giới thiệu dự án
Đây là đồ án xây dựng **hệ thống quản lý chuỗi cửa hàng cà phê** dưới dạng **Desktop Application** cho mô hình **multi-branch**, có **quản lý cơ sở dữ liệu tập trung**.

Công ty **Phụng Lộc Coffee** là một chuỗi F&B đang mở rộng nhanh, hiện có **8 chi nhánh** với khoảng **150 nhân viên**. Hiện tại, mỗi chi nhánh đang quản lý bán hàng và tồn kho bằng **Excel độc lập**, chưa có hệ thống quản lý tập trung.

Điều này dẫn đến nhiều khó khăn trong quá trình vận hành như:
- Số liệu tồn kho giữa chi nhánh và kho tổng không khớp
- Không theo dõi được hao hụt nguyên liệu theo định mức
- Không có báo cáo tổng hợp theo thời gian thực
- Khó đánh giá hiệu suất hoạt động của từng chi nhánh

Trong bối cảnh doanh nghiệp dự kiến mở thêm **3 chi nhánh trong năm tới**, việc xây dựng một hệ thống quản lý tập trung là rất cần thiết để nâng cao hiệu quả kiểm soát và vận hành.

---

## Vấn đề kinh doanh
Hệ thống hiện tại đang gặp các vấn đề sau:
- Tỷ lệ hao hụt nguyên liệu cao, khoảng **5–7%**
- Kiểm kho mất nhiều thời gian và dễ sai sót
- Không xác định chính xác lợi nhuận theo từng chi nhánh
- Không kiểm soát tốt việc điều chuyển nguyên liệu giữa các chi nhánh

---

## Mục tiêu dự án
Dự án được xây dựng nhằm đạt được các mục tiêu sau:
- Giảm tỷ lệ lãng phí nguyên liệu xuống **dưới 2%**
- Giảm **50% thời gian kiểm kho**
- Cung cấp báo cáo doanh thu theo chi nhánh **gần thời gian thực**
- Tự động trừ kho theo **định mức công thức pha chế (recipe)**

---

## Ràng buộc và yêu cầu đặc biệt
- **Thời gian triển khai:** 5 tháng
- **Ngân sách:** 800 triệu VNĐ
- **Đội ngũ thực hiện:** 5 người
- Hệ thống phải hoạt động được **offline khi mất mạng** và **đồng bộ lại khi có mạng**
- Các máy POS được phép lưu dữ liệu cục bộ khi mất kết nối và đồng bộ về **CSDL trung tâm** sau đó
- Hệ thống sử dụng **cơ sở dữ liệu tập trung**, các POS kết nối về trung tâm
- Phương pháp triển khai gợi ý:
  - **Waterfall** cho phần lõi (Core)
  - **Scrum** cho phần báo cáo Dashboard

---

## Phạm vi nghiệp vụ
Hệ thống bao gồm các chức năng chính:
- POS bán hàng
- Quản lý menu và định mức nguyên liệu
- Nhập – xuất – điều chuyển kho
- Kiểm kho
- Báo cáo doanh thu và tồn kho
- Đồng bộ dữ liệu khi offline

---

## Tiêu chí thành công
Dự án được xem là thành công khi đạt các điều kiện sau:
- Sai lệch tồn kho giữa các chi nhánh **dưới 3%**
- POS xử lý giao dịch **dưới 2 giây**
- Báo cáo doanh thu được cập nhật trong vòng **5 phút**
- Hệ thống hoạt động ổn định trong giờ cao điểm

---

## Thách thức quản lý
Một số thách thức chính trong quá trình triển khai:
- Rủi ro mất dữ liệu khi đồng bộ
- Kháng cự thay đổi từ nhân viên
- Khó kiểm soát phạm vi khi ban giám đốc yêu cầu thêm tính năng
- Đảm bảo tiến độ trong môi trường nhiều chi nhánh

---

## Risk Scenarios ban đầu
- Xung đột dữ liệu khi đồng bộ offline
- Nhân viên nhập sai dữ liệu trên POS
- Mất kết nối mạng kéo dài
- Máy chủ cơ sở dữ liệu bị quá tải vào giờ cao điểm

---

## Giả định
Dự án được xây dựng dựa trên các giả định sau:
- Tất cả chi nhánh có kết nối Internet ổn định
- Nhân viên có thể sử dụng phần mềm POS cơ bản
- Mỗi chi nhánh có tối thiểu 1 máy POS
- Số lượng giao dịch dự kiến: **3000–5000 giao dịch/ngày**
- Số lượng sản phẩm: **500**
- Số lượng nguyên liệu: **100**
- Số lượng chi nhánh hiện tại: **8**

---

## Loại hệ thống
- **Desktop Application**
- **Multi-branch Management**
- **Centralized Database**
- **Offline Sync Support**

---

## Kết luận
Dự án **Hệ thống quản lý chuỗi cửa hàng cà phê** hướng đến việc số hóa và tập trung hóa hoạt động vận hành của Phụng Lộc Coffee, giúp doanh nghiệp kiểm soát tốt hơn tồn kho, doanh thu, nguyên liệu và hiệu suất của từng chi nhánh. Đây là nền tảng quan trọng để hỗ trợ công ty mở rộng quy mô bền vững trong tương lai.
