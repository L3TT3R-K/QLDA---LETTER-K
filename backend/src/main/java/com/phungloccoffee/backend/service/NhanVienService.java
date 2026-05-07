package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.phungloccoffee.backend.dto.NhanVienResponse;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NhanVienService {
    @Autowired 
    private NhanVienRepository repository;
    
    public List<NhanVienResponse> getAllNhanVien(){
        List<NhanVien> listNhanVien = repository.findAll();
        
        // Biến đổi từng Entity thành DTO
        return listNhanVien.stream().map(nv -> {
            NhanVienResponse dto = new NhanVienResponse();
            dto.setMaNV(nv.getMaNV());
            dto.setTenNV(nv.getTenNV());
            dto.setChucVu(nv.getChucVu());
            
            // Lấy tên chi nhánh (nếu có)
            if (nv.getChiNhanh() != null) {
                dto.setTenChiNhanh(nv.getChiNhanh().getTenCN());
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    public Optional<NhanVien> getNhanVienById(String maNV){
        return repository.findById(maNV); 
    }

    public NhanVien createNhanVien(NhanVien nhanVien){
        return repository.save(nhanVien);
    }

    public NhanVien updateNhanVien(String maNV, NhanVien nhanVienDetails){
        Optional<NhanVien> optional = repository.findById(maNV); 
        if(optional.isPresent()){
            NhanVien existing = optional.get(); 

            existing.setTenNV(nhanVienDetails.getTenNV()); 
            existing.setPasswordHash(nhanVienDetails.getPasswordHash());
            existing.setChucVu(nhanVienDetails.getChucVu());
            existing.setTrangThai(nhanVienDetails.getTrangThai());
            existing.setChiNhanh(nhanVienDetails.getChiNhanh());

            return repository.save(existing);
        }
        return null;
    }

    public void deleteNhanVien(String maNV) {
        Optional<NhanVien> optional = repository.findById(maNV);
        if (optional.isPresent()) {
            NhanVien existing = optional.get();
            existing.setTrangThai(-1);
            repository.save(existing);
        }
    }

}
