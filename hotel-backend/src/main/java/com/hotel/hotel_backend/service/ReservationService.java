package com.hotel.hotel_backend.service;

import com.hotel.hotel_backend.model.Guest;
import com.hotel.hotel_backend.model.Reservation;
import com.hotel.hotel_backend.model.Room;
import com.hotel.hotel_backend.repository.GuestRepository;
import com.hotel.hotel_backend.repository.ReservationRepository;
import com.hotel.hotel_backend.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              RoomRepository roomRepository,
                              GuestRepository guestRepository) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.guestRepository = guestRepository;
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Transactional
    public Reservation createReservation(Long roomId, Guest guestData, LocalDate checkIn, LocalDate checkOut) {
        // 1. Provjera: Datum prijave ne smije biti u prošlosti
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Datum prijave ne može biti u prošlosti.");
        }

        // 2. Provjera: Datum odjave mora biti strogo nakon datuma prijave
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out datum mora biti nakon check-in datuma.");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Soba ne postoji."));

        // 3. Provjera: Sprječavanje overbookinga (preklapanje termina)
        List<Reservation> overlaps = reservationRepository.findOverlappingReservations(roomId, checkIn, checkOut);
        if (!overlaps.isEmpty()) {
            throw new IllegalStateException("Soba je već rezervirana u zadanom periodu!");
        }

        // Ako gost već postoji po emailu, iskoristi postojećeg, inače spremi novog
        Guest guest = guestRepository.findByEmail(guestData.getEmail())
                .orElseGet(() -> guestRepository.save(guestData));

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Reservation reservation = new Reservation(null, room, guest, checkIn, checkOut, totalPrice, "CONFIRMED");
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation updateStatus(Long reservationId, String newStatus) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Rezervacija ne postoji."));
        reservation.setStatus(newStatus);
        return reservationRepository.save(reservation);
    }
}