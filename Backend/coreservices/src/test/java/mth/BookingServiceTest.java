package mth;

import mth.dto.BookingRequest;
import mth.entity.Resource;
import mth.repository.ResourceRepository;
import mth.services.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class BookingServiceTest {

    @Autowired BookingService bookingService;
    @Autowired ResourceRepository resourceRepository;

    @Test
    void overlappingBookingThrowsConflict() {
        Resource r = new Resource();
        r.setName("Test Room"); r.setType("Room"); r.setCapacity(5); r.setLocation("A");
        r = resourceRepository.save(r);

        LocalDate day = LocalDate.now().plusDays(1);
        BookingRequest req = new BookingRequest();
        req.setResourceId(r.getId());
        req.setFromDate(day);
        req.setToDate(day);
        req.setFromTime(LocalTime.of(9, 0));
        req.setToTime(LocalTime.of(11, 0));
        req.setPurpose("Test");

        bookingService.createBooking(req, "test@reserva.com");

        BookingRequest overlap = new BookingRequest();
        overlap.setResourceId(r.getId());
        overlap.setFromDate(day);
        overlap.setToDate(day);
        overlap.setFromTime(LocalTime.of(10, 0));
        overlap.setToTime(LocalTime.of(12, 0));
        overlap.setPurpose("Overlap");

        assertThrows(RuntimeException.class, () ->
                bookingService.createBooking(overlap, "other@reserva.com"));
    }
}
