package com.phungloccoffee.backend.controller;

import com.phungloccoffee.backend.entity.NhanVien;
import com.phungloccoffee.backend.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhanvien")
public class NhanVienController {
    @Autowired 
    private NhanVienService service; 

    @GetMapping 
    public List<NhanVien> getAll(){
        return service.getAllNhanVien();
    }

    @PostMapping 
    public NhanVien create(@RequestBody NhanVien nhanVien){
        return service.createNhanVien(nhanVien);
    }

    @PutMapping("/{maNV}")
    public ResponseEntity<NhanVien> update(@PathVariable String maNV, @RequestBody NhanVien nhanVienDetails) {
        NhanVien updated = service.updateNhanVien(maNV, nhanVienDetails);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{maNV}")
    public ResponseEntity<Void> delete(@PathVariable String maNV) {
        service.deleteNhanVien(maNV);
        return ResponseEntity.ok().build();
    }

}
