-- Add billing_address column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS billing_address text;
