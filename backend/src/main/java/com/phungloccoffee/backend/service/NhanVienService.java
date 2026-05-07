package com.phungloccoffee.backend.service;

import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.repository.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhanVienService {
    @Autowired 
    private NhanVienRepository repository;
    
    public List<NhanVien> getAllNhanVien(){
        return repository.findAll();
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
