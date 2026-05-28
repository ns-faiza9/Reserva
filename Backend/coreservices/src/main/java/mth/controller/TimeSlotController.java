package mth.controller;

import mth.dto.TimeSlotDto;
import mth.entity.TimeSlot;
import mth.repository.TimeSlotRepository;
import mth.services.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/time-slots")
@CrossOrigin(origins = "*")
public class TimeSlotController {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private AvailabilityService availabilityService;

    @GetMapping
    public List<TimeSlotDto> getAllTimeSlots(
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (resourceId != null && date != null) {
            return availabilityService.getAvailabilityForResource(resourceId, date);
        }

        return timeSlotRepository.findAll().stream().map(slot -> {
            TimeSlotDto dto = new TimeSlotDto();
            dto.setId(slot.getId());
            dto.setStartTime(slot.getStartTime());
            dto.setEndTime(slot.getEndTime());
            dto.setAvailable(true);
            return dto;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public TimeSlot createTimeSlot(@RequestBody TimeSlot timeSlot) {
        return timeSlotRepository.save(timeSlot);
    }
}
