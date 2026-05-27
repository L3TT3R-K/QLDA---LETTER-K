package com.phungloccoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NguyenLieuResponse {
    private String maNL;
    private String tenNL;
<<<<<<< HEAD
    private Double tonToiThieu;
    private String tenDonVi;
    private Integer trangThai;
}
=======
    private String donViCoBan;
    private Double tonToiThieu; 
    private Integer trangThai;
}
>>>>>>> 47d02dc8386c090471396d0803dce3aef6b65174
