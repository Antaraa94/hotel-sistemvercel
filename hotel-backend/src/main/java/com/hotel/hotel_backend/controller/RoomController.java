package com.hotel.hotel_backend.controller;

import com.hotel.hotel_backend.model.Room;
import com.hotel.hotel_backend.repository.RoomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*") // Omogućuje Next.js/React frontendu pristup bez CORS blokade
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // GET /api/rooms - Vraća sve sobe
    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // POST /api/rooms - Dodavanje nove sobe
    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        return roomRepository.save(room);
    }
}