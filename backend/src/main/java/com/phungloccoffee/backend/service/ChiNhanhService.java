package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.ChiNhanh;
import com.phungloccoffee.backend.repository.ChiNhanhRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChiNhanhService {

    @Autowired // Spring tự động nhét object dependency vào cho mình
    private ChiNhanhRepository repository;

    // [R] Lấy danh sách tất cả
    public List<ChiNhanh> getAllChiNhanh() {
        return repository.findAll();
    }

    // [R] Tìm 1 chi nhánh theo Mã (Phục vụ cho việc Update)
    public Optional<ChiNhanh> getChiNhanhById(String maCN) {
        return repository.findById(maCN);
    }

    // [C] Thêm mới
    public ChiNhanh createChiNhanh(ChiNhanh chiNhanh) {
        return repository.save(chiNhanh);
    }

    // [U] Cập nhật thông tin chi nhánh
    public ChiNhanh updateChiNhanh(String maCN, ChiNhanh chiNhanhDetails) {
        // Tìm xem chi nhánh có tồn tại không
        Optional<ChiNhanh> optional = repository.findById(maCN);
        if (optional.isPresent()) {
            ChiNhanh existing = optional.get();
            // Cập nhật các trường mới
            existing.setTenCN(chiNhanhDetails.getTenCN());
            existing.setDiaChi(chiNhanhDetails.getDiaChi());
            existing.setTrangThai(chiNhanhDetails.getTrangThai());
            // Lưu lại xuống Database
            return repository.save(existing);
        }
        return null; // Trả về null nếu không tìm thấy mã CN
    }

    // [D] Xóa mềm (Đổi trạng thái về -1: Giải thể)
    public void deleteChiNhanh(String maCN) {
        Optional<ChiNhanh> optional = repository.findById(maCN);
        if (optional.isPresent()) {
            ChiNhanh existing = optional.get();
            existing.setTrangThai(-1); // Đánh dấu là đã giải thể thay vì xóa hẳn
            repository.save(existing);
        }
    }
}