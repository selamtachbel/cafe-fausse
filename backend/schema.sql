-- Newsletter emails
CREATE TABLE IF NOT EXISTS newsletter_emails (
  email TEXT PRIMARY KEY
);

-- Customers (unique by email)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  time_slot TIMESTAMP NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  table_number INTEGER NOT NULL
);

-- Optional helpful index for time_slot lookups
CREATE INDEX IF NOT EXISTS idx_reservations_time ON reservations(time_slot);