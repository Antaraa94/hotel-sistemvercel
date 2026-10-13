package com.hotel.hotel_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(nullable = false)
    private String itemName; // npr. "Espresso", "Biftek", "Spa tretman"

    @Column(nullable = false)
    private BigDecimal price;
}