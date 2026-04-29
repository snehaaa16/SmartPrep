package com.placement.backend.repository;

import com.placement.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA magically writes the SQL to find a user by their email!
    Optional<User> findByEmail(String email);
    
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u ORDER BY u.points DESC")
    java.util.List<User> findAllUsersByPointsDesc();
}

