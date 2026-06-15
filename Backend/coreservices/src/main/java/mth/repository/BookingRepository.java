package mth.repository;

import mth.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.bookingDate = :bookingDate AND b.timeSlot.id = :timeSlotId AND b.status != 'CANCELLED'")
    List<Booking> findConflictingBookings(@Param("resourceId") Long resourceId, @Param("bookingDate") LocalDate bookingDate, @Param("timeSlotId") Long timeSlotId);

    List<Booking> findByUserId(String userId);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.status != 'CANCELLED'")
    List<Booking> findActiveByResourceId(@Param("resourceId") Long resourceId);

}
