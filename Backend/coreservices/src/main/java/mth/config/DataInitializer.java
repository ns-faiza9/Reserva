package mth.config;

import mth.entity.TimeSlot;
import mth.models.Users;
import mth.repository.TimeSlotRepository;
import mth.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public void run(String... args) {
        if (timeSlotRepository.count() == 0) seedTimeSlots();
        if (usersRepository.count() == 0) seedUsers();
    }

    private void seedUsers() {
        Users admin = new Users();
        admin.setFullname("Admin");
        admin.setEmail("admin@reserva.com");
        admin.setPassword("admin123");
        admin.setPhone("0000000000");
        admin.setRole(2);
        admin.setStatus(1);
        usersRepository.save(admin);
    }

    private void seedTimeSlots() {
        timeSlotRepository.save(slot(LocalTime.of(9, 0), LocalTime.of(10, 0)));
        timeSlotRepository.save(slot(LocalTime.of(10, 0), LocalTime.of(11, 0)));
        timeSlotRepository.save(slot(LocalTime.of(11, 0), LocalTime.of(12, 0)));
        timeSlotRepository.save(slot(LocalTime.of(13, 0), LocalTime.of(14, 0)));
        timeSlotRepository.save(slot(LocalTime.of(14, 0), LocalTime.of(15, 0)));
        timeSlotRepository.save(slot(LocalTime.of(15, 0), LocalTime.of(16, 0)));
        timeSlotRepository.save(slot(LocalTime.of(16, 0), LocalTime.of(17, 0)));
    }

    private TimeSlot slot(LocalTime start, LocalTime end) {
        TimeSlot ts = new TimeSlot();
        ts.setStartTime(start);
        ts.setEndTime(end);
        return ts;
    }

}
