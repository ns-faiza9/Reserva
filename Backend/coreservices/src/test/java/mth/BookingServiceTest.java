package mth;

import mth.dto.BookingRequest;
import mth.entity.Booking;
import mth.services.BookingService;
import mth.repository.BookingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @InjectMocks
    private BookingService bookingService;

    @Mock
    private BookingRepository bookingRepository;

    @Test
    void overlappingBookingThrowsConflict() {
        AtomicReference<Booking> savedBooking = new AtomicReference<>();
        when(bookingRepository.findActiveByResourceId(42L)).thenAnswer(invocation ->
                savedBooking.get() == null ? List.of() : List.of(savedBooking.get()));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(1L);
            savedBooking.set(booking);
            return booking;
        });

        LocalDate day = LocalDate.now().plusDays(1);
        BookingRequest req = new BookingRequest();
        req.setResourceId(42L);
        req.setFromDate(day);
        req.setToDate(day);
        req.setFromTime(LocalTime.of(9, 0));
        req.setToTime(LocalTime.of(11, 0));
        req.setPurpose("Test");

        bookingService.createBooking(req, "test@reserva.com");

        BookingRequest overlap = new BookingRequest();
        overlap.setResourceId(42L);
        overlap.setFromDate(day);
        overlap.setToDate(day);
        overlap.setFromTime(LocalTime.of(10, 0));
        overlap.setToTime(LocalTime.of(12, 0));
        overlap.setPurpose("Overlap");

        assertThrows(RuntimeException.class, () ->
                bookingService.createBooking(overlap, "other@reserva.com"));
    }
}
