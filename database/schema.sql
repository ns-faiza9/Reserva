-- Reserva_DB schema (PostgreSQL)
CREATE DATABASE "Reserva_DB";

\c "Reserva_DB"

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role INT NOT NULL DEFAULT 1,
    status INT NOT NULL DEFAULT 1
);

CREATE TABLE resources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    capacity INT,
    location VARCHAR(255),
    description VARCHAR(1000),
    has_projector BOOLEAN,
    has_gpu BOOLEAN
);

CREATE TABLE time_slots (
    id BIGSERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    resource_id BIGINT NOT NULL REFERENCES resources(id),
    time_slot_id BIGINT NOT NULL REFERENCES time_slots(id),
    booking_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    purpose VARCHAR(500)
);
