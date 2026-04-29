package com.placement.backend.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String name; // Only needed for Registration
    private String email;
    private String password;
}

