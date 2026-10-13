package com.hotel.hotel_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(optional = false)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private String status; // CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
}