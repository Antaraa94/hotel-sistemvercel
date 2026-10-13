package com.hotel.hotel_backend;

import com.hotel.hotel_backend.model.Room;
import com.hotel.hotel_backend.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoomRepository roomRepository;

    public DataInitializer(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roomRepository.count() == 0) {
            Room r1 = new Room(null, "101", "SINGLE", new BigDecimal("50.00"), "AVAILABLE");
            Room r2 = new Room(null, "102", "DOUBLE", new BigDecimal("80.00"), "AVAILABLE");
            Room r3 = new Room(null, "201", "DELUXE", new BigDecimal("120.00"), "AVAILABLE");
            Room r4 = new Room(null, "202", "SUITE", new BigDecimal("200.00"), "AVAILABLE");

            roomRepository.saveAll(List.of(r1, r2, r3, r4));
            System.out.println(">>> Uspjesno ubacene testne sobe u bazu! <<<");
        }
    }
}