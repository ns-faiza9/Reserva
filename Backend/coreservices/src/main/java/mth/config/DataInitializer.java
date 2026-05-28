package mth.config;

import mth.entity.Resource;
import mth.entity.TimeSlot;
import mth.models.Users;
import mth.repository.ResourceRepository;
import mth.repository.TimeSlotRepository;
import mth.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public void run(String... args) {
        if (timeSlotRepository.count() == 0) seedTimeSlots();
        if (resourceRepository.count() == 0) seedResources();
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

    private void seedResources() {
        resourceRepository.save(resource("Ada Meeting Room", "Room", 12, "Building B, Floor 2",
                "Executive meeting room with 4K display and video conferencing.", false, true));
        resourceRepository.save(resource("Turing GPU Lab", "Lab", 30, "Building A, Floor 1",
                "High-performance lab with NVIDIA GPU workstations for ML and graphics research.", true, false));
        resourceRepository.save(resource("Lovelace Conference Hall", "Room", 80, "Building C, Ground",
                "Large conference hall with projector, stage lighting, and hybrid meeting setup.", true, false));
        resourceRepository.save(resource("Hopper Compute Lab", "Lab", 24, "Building A, Floor 3",
                "GPU cluster lab for deep learning training and CUDA development.", true, true));
        resourceRepository.save(resource("Projector Suite Alpha", "Room", 20, "Building D, Floor 1",
                "Meeting room optimized for presentations with ceiling projector and whiteboards.", true, false));
        resourceRepository.save(resource("Robotics Equipment Bay", "Equipment", 8, "Engineering Wing",
                "Shared robotics kits, 3D printers, and soldering stations for project teams.", false, false));
        resourceRepository.save(resource("Quiet Study Pod 7", "Room", 4, "Library Annex",
                "Small collaborative pod for focused pair programming sessions.", false, false));
        resourceRepository.save(resource("Innovation Studio", "Room", 45, "Innovation Center",
                "Creative workshop space with projector wall and flexible seating.", true, false));
    }

    private Resource resource(String name, String type, int capacity, String location,
                              String description, boolean gpu, boolean projector) {
        Resource r = new Resource();
        r.setName(name);
        r.setType(type);
        r.setCapacity(capacity);
        r.setLocation(location);
        r.setDescription(description);
        r.setHasGpu(gpu);
        r.setHasProjector(projector);
        return r;
    }
}
