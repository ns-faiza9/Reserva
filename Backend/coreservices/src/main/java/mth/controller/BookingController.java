package mth.controller;

import mth.dto.BookingRequest;
import mth.dto.BookingResponse;
import mth.services.AuthHelper;
import mth.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;
    @Autowired
    private AuthHelper authHelper;

    @GetMapping
    public List<BookingResponse> getBookings(@RequestHeader("Token") String token) {
        return bookingService.getBookingsByUser(authHelper.emailFromToken(token));
    }

    @PostMapping
    public BookingResponse createBooking(
            @RequestHeader("Token") String token,
            @RequestBody BookingRequest request) {
        return bookingService.createBooking(request, authHelper.emailFromToken(token));
    }

    @DeleteMapping("/{id}")
    public BookingResponse cancelBooking(
            @RequestHeader("Token") String token,
            @PathVariable Long id) {
        return bookingService.cancelBooking(id, authHelper.emailFromToken(token));
    }
}
