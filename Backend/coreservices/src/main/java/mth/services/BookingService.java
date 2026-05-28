package mth.services;

import mth.dto.BookingRequest;
import mth.dto.BookingResponse;
import mth.entity.Booking;
import mth.entity.Resource;
import mth.repository.BookingRepository;
import mth.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private ResourceRepository resourceRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userId) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found."));

        LocalDate fromDate = request.getFromDate();
        LocalDate toDate = request.getToDate();
        LocalTime fromTime = request.getFromTime();
        LocalTime toTime = request.getToTime();

        if (fromDate == null || toDate == null || fromTime == null || toTime == null) {
            throw new RuntimeException("From/to date and time are required.");
        }

        LocalDateTime rangeStart = LocalDateTime.of(fromDate, fromTime);
        LocalDateTime rangeEnd = LocalDateTime.of(toDate, toTime);
        if (!rangeEnd.isAfter(rangeStart)) {
            throw new RuntimeException("'To' must be after 'From'.");
        }

        if (hasOverlap(resource.getId(), rangeStart, rangeEnd, null)) {
            throw new RuntimeException("Resource is already booked for this period.");
        }

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setResource(resource);
        booking.setTimeSlot(null);
        booking.setFromDate(fromDate);
        booking.setToDate(toDate);
        booking.setFromTime(fromTime);
        booking.setToTime(toTime);
        booking.setBookingDate(fromDate);
        booking.setStatus("CONFIRMED");
        booking.setPurpose(request.getPurpose());

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this booking.");
        }
        booking.setStatus("CANCELLED");
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean hasOverlap(Long resourceId, LocalDateTime start, LocalDateTime end, Long excludeId) {
        for (Booking b : bookingRepository.findActiveByResourceId(resourceId)) {
            if (excludeId != null && excludeId.equals(b.getId())) continue;
            LocalDateTime existingStart = bookingRangeStart(b);
            LocalDateTime existingEnd = bookingRangeEnd(b);
            if (start.isBefore(existingEnd) && existingStart.isBefore(end)) {
                return true;
            }
        }
        return false;
    }

    private LocalDateTime bookingRangeStart(Booking b) {
        if (b.getFromDate() != null && b.getFromTime() != null) {
            return LocalDateTime.of(b.getFromDate(), b.getFromTime());
        }
        LocalDate d = b.getBookingDate();
        if (b.getTimeSlot() != null && d != null) {
            return LocalDateTime.of(d, b.getTimeSlot().getStartTime());
        }
        return LocalDateTime.MIN;
    }

    private LocalDateTime bookingRangeEnd(Booking b) {
        if (b.getToDate() != null && b.getToTime() != null) {
            return LocalDateTime.of(b.getToDate(), b.getToTime());
        }
        LocalDate d = b.getBookingDate();
        if (b.getTimeSlot() != null && d != null) {
            return LocalDateTime.of(d, b.getTimeSlot().getEndTime());
        }
        return LocalDateTime.MAX;
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUserId());
        response.setResourceId(booking.getResource().getId());
        response.setResourceName(booking.getResource().getName());
        response.setResourceType(booking.getResource().getType());
        response.setResourceLocation(booking.getResource().getLocation());
        response.setStatus(booking.getStatus());
        response.setPurpose(booking.getPurpose());

        LocalDate fromDate = booking.getFromDate() != null ? booking.getFromDate() : booking.getBookingDate();
        LocalDate toDate = booking.getToDate() != null ? booking.getToDate() : booking.getBookingDate();
        LocalTime fromTime = booking.getFromTime();
        LocalTime toTime = booking.getToTime();
        if (fromTime == null && booking.getTimeSlot() != null) {
            fromTime = booking.getTimeSlot().getStartTime();
            toTime = booking.getTimeSlot().getEndTime();
        }

        response.setFromDate(fromDate);
        response.setToDate(toDate);
        response.setFromTime(fromTime);
        response.setToTime(toTime);
        response.setBookingDate(fromDate);
        response.setStartTime(fromTime);
        response.setEndTime(toTime);
        return response;
    }
}
