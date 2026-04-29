package com.placement.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Data // This Lombok annotation automatically creates Getters and Setters!
@Entity // Tells Spring to make a database table out of this class
@Table(name = "users") // We want the table to be named "users"
public class User {

    @Id // This is the Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increments (1, 2, 3...)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private int points = 0;

    private int currentStreak = 0;

    private int highestStreak = 0;

    private Date lastActiveDate;

    // We will use Spring Security roles later (e.g., "ROLE_USER" or "ROLE_ADMIN")
    private String role = "ROLE_USER";
}

