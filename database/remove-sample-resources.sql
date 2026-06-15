-- Removes the old demo resources from an existing PostgreSQL database.
-- Run this after deploying the DataInitializer change so these rows do not return.

DELETE FROM bookings
WHERE resource_id IN (
    SELECT id
    FROM resources
    WHERE name IN (
        'Ada Meeting Room',
        'Turing GPU Lab',
        'Lovelace Conference Hall',
        'Hopper Compute Lab',
        'Projector Suite Alpha',
        'Robotics Equipment Bay',
        'Quiet Study Pod 7',
        'Innovation Studio'
    )
    AND catalog_id IS NULL
);

DELETE FROM resources
WHERE name IN (
    'Ada Meeting Room',
    'Turing GPU Lab',
    'Lovelace Conference Hall',
    'Hopper Compute Lab',
    'Projector Suite Alpha',
    'Robotics Equipment Bay',
    'Quiet Study Pod 7',
    'Innovation Studio'
)
AND catalog_id IS NULL;
