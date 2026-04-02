package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private Role role;
}