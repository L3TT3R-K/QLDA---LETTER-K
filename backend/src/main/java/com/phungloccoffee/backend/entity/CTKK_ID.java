package com.phungloccoffee.backend.entity;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode // Bắt buộc để Spring so sánh 2 khóa
public class CTKK_ID implements Serializable {
    private String maKK;
    private String maNL;
}