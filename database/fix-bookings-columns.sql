-- Run on database Reserva_DB if booking fails with time_slot_id NOT NULL
-- pgAdmin: connect to Reserva_DB → Query Tool → paste & execute

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS from_date date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS to_date date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS from_time time;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS to_time time;

-- Required: allow bookings without a predefined time_slot row
ALTER TABLE bookings ALTER COLUMN time_slot_id DROP NOT NULL;

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
   OR b.to_time IS NULL;
