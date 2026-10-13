package com.hotel.hotel_backend.controller;

import com.hotel.hotel_backend.dto.ReservationRequest;
import com.hotel.hotel_backend.model.Guest;
import com.hotel.hotel_backend.model.Reservation;
import com.hotel.hotel_backend.service.ReservationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<Reservation> getAll() {
        return reservationService.getAllReservations();
    }

    @PostMapping
    public Reservation create(@RequestBody ReservationRequest req) {
        Guest guest = new Guest(null, req.getFirstName(), req.getLastName(), req.getEmail(), req.getPhoneNumber());
        return reservationService.createReservation(req.getRoomId(), guest, req.getCheckInDate(), req.getCheckOutDate());
    }

    @PatchMapping("/{id}/status")
    public Reservation updateStatus(@PathVariable Long id, @RequestParam String status) {
        return reservationService.updateStatus(id, status);
    }
}