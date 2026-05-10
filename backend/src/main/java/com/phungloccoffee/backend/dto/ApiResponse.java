package com.phungloccoffee.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private int status;      //200 là thành công, 400 là lỗi
    private String message;  //Thông báo cho Frontend
    private T data;          //Dữ liệu thực tế (Hóa đơn, danh sách sản phẩm...)
}