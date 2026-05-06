package com.phungloccoffee.backend.repository;

import com.phungloccoffee.backend.entity.ChiNhanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// JpaRepository<Tên_Class_Entity, Kiểu_Dữ_Liệu_Của_Khóa_Chính>
public interface ChiNhanhRepository extends JpaRepository<ChiNhanh, String> {
    // Chỉ cần khai báo thế này, Spring Boot đã tự tạo sẵn các hàm 
    // save(), findAll(), findById(), deleteById() cho bạn rồi!
}