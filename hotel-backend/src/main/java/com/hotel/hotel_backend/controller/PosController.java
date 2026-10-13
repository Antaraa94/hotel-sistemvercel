package com.hotel.hotel_backend.controller;

import com.hotel.hotel_backend.model.OrderItem;
import com.hotel.hotel_backend.model.Reservation;
import com.hotel.hotel_backend.repository.OrderItemRepository;
import com.hotel.hotel_backend.repository.ReservationRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pos")
@CrossOrigin(origins = "*")
public class PosController {

    private final OrderItemRepository orderItemRepository;
    private final ReservationRepository reservationRepository;

    public PosController(OrderItemRepository orderItemRepository, ReservationRepository reservationRepository) {
        this.orderItemRepository = orderItemRepository;
        this.reservationRepository = reservationRepository;
    }

    // Dodaj stavku na račun sobe / rezervacije
    @PostMapping("/charge-to-room")
    public OrderItem chargeToRoom(@RequestBody Map<String, Object> payload) {
        Long reservationId = Long.valueOf(payload.get("reservationId").toString());
        String itemName = payload.get("itemName").toString();
        BigDecimal price = new BigDecimal(payload.get("price").toString());

        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Rezervacija ne postoji."));

        if (!"CHECKED_IN".equals(res.getStatus())) {
            throw new IllegalStateException("Trošak se može staviti na sobu samo ako je gost trenutno prijavljen (CHECKED_IN)!");
        }

        OrderItem item = new OrderItem(null, res, itemName, price);
        return orderItemRepository.save(item);
    }

    // Dohvati sve stavke za odabranu rezervaciju
    @GetMapping("/orders/{reservationId}")
    public List<OrderItem> getOrders(@PathVariable Long reservationId) {
        return orderItemRepository.findByReservationId(reservationId);
    }
}