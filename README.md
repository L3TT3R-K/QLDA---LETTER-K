# Phụng Lộc Coffee - Hệ thống quản lý chuỗi cửa hàng cà phê

## 1. Giới thiệu dự án

**Phụng Lộc Coffee** là hệ thống quản lý chuỗi cửa hàng cà phê, được xây dựng nhằm hỗ trợ quản lý bán hàng, tồn kho, nguyên liệu, chi nhánh và báo cáo doanh thu cho mô hình nhiều chi nhánh.

Hiện tại, Phụng Lộc Coffee có nhiều chi nhánh hoạt động độc lập, việc quản lý bán hàng và kho bằng Excel gây ra nhiều vấn đề như sai lệch tồn kho, khó kiểm soát hao hụt nguyên liệu, thiếu báo cáo tổng hợp và khó đánh giá hiệu suất từng chi nhánh.

Dự án hướng đến việc xây dựng một hệ thống tập trung giúp đồng bộ dữ liệu giữa các chi nhánh, hỗ trợ bán hàng tại POS, quản lý kho, quản lý công thức pha chế và cung cấp báo cáo doanh thu theo thời gian thực.

---

## 2. Mục tiêu dự án

- Quản lý tập trung dữ liệu của toàn bộ chuỗi cửa hàng.
- Hỗ trợ bán hàng tại quầy thông qua chức năng POS.
- Tự động trừ kho nguyên liệu theo định mức công thức pha chế.
- Quản lý nhập kho, xuất kho, điều chuyển kho và kiểm kho.
- Theo dõi doanh thu, tồn kho và hiệu suất từng chi nhánh.
- Giảm sai lệch tồn kho và hạn chế hao hụt nguyên liệu.
- Hỗ trợ hoạt động offline khi mất mạng và đồng bộ dữ liệu khi có mạng trở lại.

---

## 3. Phạm vi chức năng

### 3.1. Quản lý bán hàng POS

- Tạo hóa đơn bán hàng.
- Chọn sản phẩm từ menu.
- Tính tổng tiền đơn hàng.
- Ghi nhận giao dịch bán hàng.
- Tự động cập nhật tồn kho sau khi bán.

### 3.2. Quản lý menu

- Thêm, sửa, xóa sản phẩm.
- Quản lý giá bán sản phẩm.
- Quản lý trạng thái kinh doanh của sản phẩm.
- Phân loại sản phẩm theo nhóm.

### 3.3. Quản lý nguyên liệu và công thức

- Quản lý danh sách nguyên liệu.
- Quản lý đơn vị tính.
- Thiết lập định mức nguyên liệu cho từng sản phẩm.
- Tự động trừ nguyên liệu theo công thức khi phát sinh giao dịch bán hàng.

### 3.4. Quản lý kho

- Nhập kho nguyên liệu.
- Xuất kho nguyên liệu.
- Điều chuyển nguyên liệu giữa các chi nhánh.
- Kiểm kê tồn kho.
- Theo dõi tồn kho tối thiểu.
- Cảnh báo nguyên liệu sắp hết.

### 3.5. Quản lý chi nhánh

- Quản lý thông tin chi nhánh.
- Theo dõi doanh thu theo chi nhánh.
- Theo dõi tồn kho theo chi nhánh.
- Quản lý nhân viên theo chi nhánh.

### 3.6. Quản lý nhân viên và tài khoản

- Quản lý thông tin nhân viên.
- Cấp tài khoản đăng nhập.
- Phân quyền người dùng theo vai trò.
- Theo dõi trạng thái hoạt động của tài khoản.

### 3.7. Báo cáo thống kê

- Báo cáo doanh thu theo ngày, tháng, chi nhánh.
- Báo cáo tồn kho.
- Báo cáo nhập - xuất - tồn.
- Báo cáo sản phẩm bán chạy.
- Báo cáo hiệu suất từng chi nhánh.

---

## 4. Người dùng hệ thống

| Vai trò | Mô tả |
|---|---|
| Quản trị viên | Quản lý toàn bộ hệ thống, tài khoản, chi nhánh, nhân viên và dữ liệu chung |
| Quản lý chi nhánh | Theo dõi bán hàng, kho và nhân viên tại chi nhánh |
| Nhân viên bán hàng | Thực hiện bán hàng, tạo hóa đơn, xử lý đơn tại POS |
| Nhân viên kho | Quản lý nhập kho, xuất kho, điều chuyển và kiểm kho |

---

## 5. Công nghệ sử dụng

> Có thể chỉnh lại phần này theo đúng source code thực tế của nhóm.

### Backend

- Java
- Spring Boot
- Spring Data JPA
- RESTful API
- Lombok

### Database

- PostgreSQL

### Frontend

- HTML
- CSS
- JavaScript
- Bootstrap

### Công cụ phát triển

- Git / GitHub
- Postman
- IntelliJ IDEA / VS Code
- pgAdmin

---

## 6. Kiến trúc hệ thống

Hệ thống được thiết kế theo mô hình nhiều lớp:

```text
Client / UI
    ↓
Controller Layer
    ↓
Service Layer
    ↓
Repository Layer
    ↓
Database
```

### Mô tả các lớp

- **Client / UI**: Giao diện người dùng, hỗ trợ thao tác bán hàng, quản lý kho, quản lý dữ liệu và xem báo cáo.
- **Controller Layer**: Tiếp nhận request từ client và trả response.
- **Service Layer**: Xử lý nghiệp vụ chính của hệ thống.
- **Repository Layer**: Làm việc với cơ sở dữ liệu thông qua JPA.
- **Database**: Lưu trữ dữ liệu tập trung của hệ thống.

---

## 7. Cấu trúc thư mục tham khảo

```text
phung-loc-coffee/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/phungloccoffee/backend/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── repository/
│   │   │   │       ├── entity/
│   │   │   │       ├── dto/
│   │   │   │       └── config/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   │
│   │   └── test/
│   │
│   └── pom.xml
│
├── frontend/
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   └── pages/
│
├── database/
│   ├── schema.sql
│   ├── mockdata.sql
│   └── trigger.sql
│
└── README.md
```

---

## 8. Hướng dẫn cài đặt và chạy dự án

### 8.1. Yêu cầu môi trường

Cần cài đặt trước:

- Java JDK 17 hoặc phiên bản phù hợp với dự án.
- Maven.
- PostgreSQL.
- Git.
- Trình duyệt web.
- IDE như IntelliJ IDEA hoặc VS Code.

---

### 8.2. Clone source code

```bash
git clone <link-repository>
cd phung-loc-coffee
```

---

### 8.3. Tạo cơ sở dữ liệu PostgreSQL

Đăng nhập PostgreSQL và tạo database:

```sql
CREATE DATABASE phungloc_db;
```

Sau đó chạy lần lượt các file SQL trong thư mục `database` nếu có:

```text
schema.sql
mockdata.sql
trigger.sql
```

---

### 8.4. Cấu hình kết nối database

Mở file:

```text
backend/src/main/resources/application.yml
```

Cấu hình ví dụ:

```yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/phungloc_db
    username: postgres
    password: 123456
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

---

### 8.5. Chạy Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Chạy ứng dụng:

```bash
mvn spring-boot:run
```

Backend mặc định chạy tại:

```text
http://localhost:8080
```

---

### 8.6. Chạy Frontend

Nếu frontend là HTML/CSS/JS thuần, có thể mở trực tiếp file:

```text
frontend/index.html
```

Hoặc dùng Live Server trong VS Code để chạy giao diện.

---

## 9. Một số API chính

| Method | API | Chức năng |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập hệ thống |
| GET | `/api/sanpham` | Lấy danh sách sản phẩm |
| POST | `/api/sanpham` | Thêm sản phẩm |
| PUT | `/api/sanpham/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/sanpham/{id}` | Xóa hoặc ngừng kinh doanh sản phẩm |
| GET | `/api/nguyenlieu` | Lấy danh sách nguyên liệu |
| POST | `/api/nguyenlieu` | Thêm nguyên liệu |
| GET | `/api/nhapkho` | Lấy danh sách phiếu nhập kho |
| POST | `/api/nhapkho` | Tạo phiếu nhập kho |
| GET | `/api/xuatkho` | Lấy danh sách phiếu xuất kho |
| POST | `/api/xuatkho` | Tạo phiếu xuất kho |
| GET | `/api/baocao/doanhthu` | Xem báo cáo doanh thu |
| GET | `/api/baocao/tonkho` | Xem báo cáo tồn kho |

---

## 10. Tài khoản demo

> Cập nhật lại theo dữ liệu mockdata thực tế của nhóm.

| Vai trò | Tài khoản | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin01` | `1` |
| Nhân viên kho | `nvkho01` | `1` |
| Nhân viên bán hàng | `nvbh01` | `1` |

---

## 11. Tiêu chí thành công

Dự án được xem là thành công khi:

- Sai lệch tồn kho giữa các chi nhánh nhỏ hơn 3%.
- POS xử lý giao dịch trong thời gian dưới 2 giây.
- Báo cáo doanh thu được cập nhật trong vòng 5 phút.
- Hệ thống hoạt động ổn định trong giờ cao điểm.
- Dữ liệu bán hàng, tồn kho và chi nhánh được quản lý tập trung.

---

## 12. Rủi ro và hướng xử lý

| Rủi ro | Hướng xử lý |
|---|---|
| Mất kết nối mạng | Cho phép POS lưu tạm dữ liệu cục bộ và đồng bộ lại khi có mạng |
| Xung đột dữ liệu khi đồng bộ | Thiết kế cơ chế kiểm tra phiên bản dữ liệu và ghi log đồng bộ |
| Nhân viên nhập sai dữ liệu | Kiểm tra ràng buộc dữ liệu ở frontend, backend và database |
| Server quá tải giờ cao điểm | Tối ưu truy vấn, phân trang dữ liệu, cache báo cáo cần thiết |
| Sai lệch tồn kho | Ghi nhận đầy đủ nhập, xuất, bán hàng, điều chuyển và kiểm kho |

---

## 13. Thành viên nhóm

| STT | Họ tên | Vai trò |
|---|---|---|
| 1 |  | Nhóm trưởng |
| 2 |  | Thành viên |
| 3 |  | Thành viên |
| 4 |  | Thành viên |
| 5 |  | Thành viên |

---

## 14. Ghi chú

README này được xây dựng dựa trên yêu cầu bài toán **Hệ thống quản lý chuỗi cửa hàng cà phê - Phụng Lộc Coffee**. Một số phần như công nghệ, API, tài khoản demo và cấu trúc thư mục có thể cần chỉnh lại theo source code thực tế của nhóm.
