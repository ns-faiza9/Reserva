package mth.services;

import mth.dto.TimeSlotDto;
import mth.entity.TimeSlot;
import mth.repository.BookingRepository;
import mth.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public boolean isResourceAvailableOnDate(Long resourceId, LocalDate date) {
        List<TimeSlot> allSlots = timeSlotRepository.findAll();
        if (allSlots.isEmpty()) return true;
        long bookedCount = allSlots.stream()
                .filter(slot -> !bookingRepository.findConflictingBookings(resourceId, date, slot.getId()).isEmpty())
                .count();
        return bookedCount < allSlots.size();
    }

    public List<TimeSlotDto> getAvailabilityForResource(Long resourceId, LocalDate date) {
        return timeSlotRepository.findAll().stream()
                .map(slot -> toDto(slot, resourceId, date))
                .collect(Collectors.toList());
    }

    private TimeSlotDto toDto(TimeSlot slot, Long resourceId, LocalDate date) {
        TimeSlotDto dto = new TimeSlotDto();
        dto.setId(slot.getId());
        dto.setStartTime(slot.getStartTime());
        dto.setEndTime(slot.getEndTime());
        boolean booked = !bookingRepository.findConflictingBookings(resourceId, date, slot.getId()).isEmpty();
        dto.setAvailable(!booked);
        return dto;
    }
}
