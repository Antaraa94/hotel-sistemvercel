package com.hotel.hotel_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReservationRequest {
    private Long roomId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
}