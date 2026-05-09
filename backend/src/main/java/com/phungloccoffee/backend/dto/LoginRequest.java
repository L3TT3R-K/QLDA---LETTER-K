
//Khi user điền form đăng nhập trên Frontend, họ chỉ gửi lên Username và Password.

package com.phungloccoffee.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String username;
    private String password;
}