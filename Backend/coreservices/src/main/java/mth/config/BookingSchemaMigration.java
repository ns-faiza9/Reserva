package mth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Aligns PostgreSQL bookings table with range-based booking (from/to date & time).
 * time_slot_id is optional; legacy rows are backfilled.
 */
@Component
@Order(0)
public class BookingSchemaMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BookingSchemaMigration.class);
    private final JdbcTemplate jdbc;

    public BookingSchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        migrate();
    }

    private void migrate() {
        try {
            jdbc.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS from_date date");
            jdbc.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS to_date date");
            jdbc.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS from_time time");
            jdbc.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS to_time time");
        } catch (Exception e) {
            log.debug("Column add skipped: {}", e.getMessage());
        }

        try {
            jdbc.execute("ALTER TABLE bookings ALTER COLUMN time_slot_id DROP NOT NULL");
            log.info("bookings.time_slot_id is now nullable (range bookings)");
        } catch (Exception e) {
            log.warn("Could not drop NOT NULL on time_slot_id: {}", e.getMessage());
        }

        try {
            int updated = jdbc.update("""
                UPDATE bookings b
                SET
                  from_date = COALESCE(b.from_date, b.booking_date, CURRENT_DATE),
                  to_date = COALESCE(b.to_date, b.booking_date, CURRENT_DATE),
                  from_time = COALESCE(
                    b.from_time,
                    (SELECT ts.start_time FROM time_slots ts WHERE ts.id = b.time_slot_id),
                    TIME '09:00'
                  ),
                  to_time = COALESCE(
                    b.to_time,
                    (SELECT ts.end_time FROM time_slots ts WHERE ts.id = b.time_slot_id),
                    TIME '17:00'
                  )
                WHERE b.from_date IS NULL
                   OR b.to_date IS NULL
                   OR b.from_time IS NULL
                   OR b.to_time IS NULL
                """);
            if (updated > 0) {
                log.info("Backfilled from/to fields on {} booking(s)", updated);
            }
        } catch (Exception e) {
            log.debug("Backfill skipped: {}", e.getMessage());
        }
    }
}
