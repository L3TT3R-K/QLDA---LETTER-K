## Project Structure

```text
QLDA---LETTER-K/
│
├── UI-QLDA/                                     # Frontend Application (Next.js)
│   │
│   ├── app/                                     # App Router Pages
│   │   ├── admin/                               # Chức năng quản trị hệ thống
│   │   ├── catalog/                             # Quản lý danh mục sản phẩm
│   │   ├── employee/                            # Quản lý nhân viên
│   │   ├── inventory/                           # Quản lý kho
│   │   ├── login/                               # Đăng nhập
│   │   ├── logs/                                # Nhật ký hệ thống
│   │   ├── manager/                             # Chức năng quản lý
│   │   ├── pos/                                 # Point Of Sale (Bán hàng)
│   │   ├── reports/                             # Báo cáo - Thống kê
│   │   ├── system/                              # Cấu hình hệ thống
│   │   ├── globals.css                          # Global Styles
│   │   ├── layout.tsx                           # Layout chính
│   │   └── page.tsx                             # Trang chủ
│   │
│   ├── components/                              # Reusable Components
│   │   ├── auth/                                # Components xác thực
│   │   ├── dashboard/                           # Components Dashboard
│   │   ├── layout/                              # Header, Sidebar, Footer
│   │   ├── pos/                                 # Components bán hàng
│   │   ├── ui/                                  # Shared UI Components
│   │   └── theme-provider.tsx                   # Theme Provider
│   │
│   ├── hooks/                                   # Custom React Hooks
│   ├── lib/                                     # Utility Libraries
│   ├── public/                                  # Static Assets
│   ├── services/
│   │   └── api.js                               # API Communication Layer
│   │
│   ├── styles/                                  # CSS Stylesheets
│   │   └── globals.css
│   │
│   ├── electron.js                              # Desktop Runtime (Electron)
│   ├── next.config.mjs                          # Next.js Configuration
│   ├── tsconfig.json                            # TypeScript Configuration
│   ├── package.json                             # Frontend Dependencies
│   └── package-lock.json
│
├── backend/                                     # Spring Boot Backend
│   │
│   ├── src/main/java/com/phungloccoffee/backend/
│   │   ├── controller/                          # REST API Controllers
│   │   ├── dto/                                 # Data Transfer Objects
│   │   ├── entity/                              # Database Entities
│   │   ├── repository/                          # Data Access Layer
│   │   ├── security/                            # Authentication & Authorization
│   │   ├── service/                             # Business Logic Layer
│   │   ├── utils/                               # Utility Classes
│   │   └── BackendApplication.java              # Main Application
│   │
│   ├── src/main/resources/                      # Application Configurations
│   ├── src/test/                                # Unit Tests
│   │
│   ├── pom.xml                                  # Maven Dependencies
│   ├── mvnw
│   ├── mvnw.cmd
│   └── target/                                  # Build Output
│
├── postgres/                                    # Database Scripts
│   │
│   ├── database.sql                             # Tạo bảng dữ liệu
│   ├── constraint.sql                           # Khóa chính, khóa ngoại
│   ├── trigger.sql                              # Trigger nghiệp vụ
│   └── mockdata.sql                             # Dữ liệu mẫu
│
├── README.md
├── package.json
└── package-lock.json
```

## Frontend Modules

| Module    | Chức năng                        |
| --------- | -------------------------------- |
| Login     | Đăng nhập hệ thống               |
| POS       | Tạo hóa đơn và bán hàng tại quầy |
| Inventory | Quản lý tồn kho và nhập hàng     |
| Catalog   | Quản lý danh mục và sản phẩm     |
| Employee  | Quản lý nhân viên                |
| Reports   | Thống kê và báo cáo              |
| Logs      | Theo dõi nhật ký hoạt động       |
| Admin     | Quản trị hệ thống                |
| Manager   | Các chức năng dành cho quản lý   |
| System    | Cấu hình hệ thống                |

## Backend Architecture

```text
Frontend (Next.js)
        │
        ▼
Controller Layer
        │
        ▼
Service Layer
        │
        ▼
Repository Layer
        │
        ▼
PostgreSQL Database
```

### Controller Layer

Tiếp nhận HTTP Request từ Frontend và trả về dữ liệu dưới dạng JSON.

### Service Layer

Xử lý nghiệp vụ của hệ thống như bán hàng, quản lý kho, quản lý nhân viên và thống kê.

### Repository Layer

Tương tác trực tiếp với cơ sở dữ liệu thông qua Spring Data JPA.

### Entity Layer

Ánh xạ giữa các bảng trong PostgreSQL và các đối tượng Java.

### Security Layer

Thực hiện xác thực người dùng và phân quyền truy cập hệ thống.

```
```
# Installation & Running Guide

## Prerequisites

Trước khi chạy hệ thống, cần cài đặt các phần mềm sau:

### Frontend

* Node.js (LTS Version)
* npm

Kiểm tra:

```bash
node -v
npm -v
```

### Backend

* JDK 17+
* Maven 3.x

Kiểm tra:

```bash
java -version
mvn -version
```

### Database

* PostgreSQL 15 hoặc mới hơn

---

# Database Setup

## Bước 1: Tạo Database

Mở PostgreSQL và tạo database:

```sql
CREATE DATABASE phungloccoffee;
```

## Bước 2: Import Database Scripts

Thực hiện các file SQL theo đúng thứ tự:

```text
postgres/
├── database.sql
├── constraint.sql
├── trigger.sql
└── mockdata.sql
```

Thứ tự thực thi:

```text
1. database.sql
2. constraint.sql
3. trigger.sql
4. mockdata.sql
```

Lưu ý: Việc thực thi sai thứ tự có thể gây lỗi khóa ngoại hoặc trigger.

---

# Backend Setup & Run

## Bước 1: Di chuyển vào thư mục Backend

```bash
cd backend
```

## Bước 2: Cấu hình Database

Mở file:

```text
backend/src/main/resources/application.properties
```

Cập nhật thông tin kết nối PostgreSQL:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/phungloccoffee
spring.datasource.username=postgres
spring.datasource.password=your_password
```

## Bước 3: Build Project

```bash
mvn clean install
```

Nếu build thành công sẽ xuất hiện thư mục:

```text
target/
```

## Bước 4: Chạy Backend

### Cách 1: Maven

```bash
mvn spring-boot:run
```

### Cách 2: File Jar

```bash
java -jar target/*.jar
```

## Kiểm tra Backend

Khi chạy thành công, terminal sẽ hiển thị:

```text
Started BackendApplication
Tomcat started on port(s): 8080
```

Backend mặc định hoạt động tại:

```text
http://localhost:8080
```

---

# Frontend Setup & Run

## Bước 1: Di chuyển vào thư mục Frontend

```bash
cd UI-QLDA
```

## Bước 2: Cài đặt thư viện

```bash
npm install
```

Hoặc:

```bash
npm i
```

## Bước 3: Tạo file môi trường

Tạo file:

```text
.env.local
```

Ví dụ:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Lưu ý:

* URL trên chỉ là ví dụ.
* Cần thay đổi theo địa chỉ Backend thực tế nếu có khác biệt.

## Bước 4: Chạy Frontend

```bash
npm run dev
```

Hoặc sử dụng file hỗ trợ:

```bash
run-dev.bat
```

## Kiểm tra Frontend

Nếu chạy thành công sẽ hiển thị:

```text
▲ Next.js

Local:    http://localhost:3000
Network:  http://xxx.xxx.xxx.xxx:3000
```

Truy cập hệ thống tại:

```text
http://localhost:3000
```

---

# Startup Order

Để hệ thống hoạt động chính xác, cần khởi động theo thứ tự sau:

```text
1. PostgreSQL Database
        ↓
2. Import SQL Scripts
        ↓
3. Spring Boot Backend
        ↓
4. Next.js Frontend
        ↓
5. Truy cập hệ thống tại:
   http://localhost:3000
```

---

# Common Issues

| Lỗi                             | Nguyên nhân                            | Cách xử lý                                    |
| ------------------------------- | -------------------------------------- | --------------------------------------------- |
| npm is not recognized           | Chưa cài Node.js hoặc chưa thêm PATH   | Cài lại Node.js LTS                           |
| mvn is not recognized           | Chưa cài Maven                         | Cài Maven và thêm PATH                        |
| Port 3000 already in use        | Frontend bị trùng cổng                 | Đổi cổng hoặc tắt ứng dụng đang sử dụng       |
| Port 8080 already in use        | Backend bị trùng cổng                  | Đổi server.port trong Spring Boot             |
| Cannot connect to database      | PostgreSQL chưa chạy hoặc sai cấu hình | Kiểm tra PostgreSQL và application.properties |
| Frontend không lấy được dữ liệu | Backend chưa chạy hoặc sai API URL     | Kiểm tra NEXT_PUBLIC_API_URL                  |
| Build failed                    | Thiếu dependency                       | Chạy lại npm install hoặc mvn clean install   |

```
```
