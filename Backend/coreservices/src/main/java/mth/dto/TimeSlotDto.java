package mth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public class TimeSlotDto {

    private Long id;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
    private boolean available;

    public TimeSlotDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
