package com.hotel.hotel_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomNumber;

    @Column(nullable = false)
    private String type; // npr. SINGLE, DOUBLE, SUITE

    @Column(nullable = false)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    private String status; // AVAILABLE, OCCUPIED, CLEANING
}