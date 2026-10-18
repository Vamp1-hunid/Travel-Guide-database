-- Travel Destination Guide
-- Run this file once against your PostgreSQL database.
-- This script drops and recreates the destinations table, then inserts exactly 10 sample records.

DROP TABLE IF EXISTS destinations;

CREATE TABLE destinations (
  id SERIAL PRIMARY KEY,

  destination VARCHAR(150) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  continent VARCHAR(50),
  description TEXT,
  best_season VARCHAR(100),

  average_budget_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  visa_required BOOLEAN NOT NULL DEFAULT FALSE,
  safety_rating SMALLINT NOT NULL DEFAULT 3
    CHECK (safety_rating BETWEEN 1 AND 5),

  top_attraction VARCHAR(255),
  language VARCHAR(100),
  currency VARCHAR(50),

  status VARCHAR(30) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_destinations_updated_at
BEFORE UPDATE ON destinations
FOR EACH ROW
EXECUTE FUNCTION set_destinations_updated_at();

INSERT INTO destinations (
  destination,
  country,
  region,
  continent,
  description,
  best_season,
  average_budget_usd,
  visa_required,
  safety_rating,
  top_attraction,
  language,
  currency,
  status
) VALUES
(
  'Victoria Falls',
  'Zambia',
  'Southern Province',
  'Africa',
  'A town famous for Mosi-oa-Tunya, one of the largest waterfalls in the world.',
  'April to May',
  850.00,
  FALSE,
  4,
  'Mosi-oa-Tunya / Victoria Falls',
  'English',
  'ZMW',
  'active'
),
(
  'Cape Town',
  'South Africa',
  'Western Cape',
  'Africa',
  'A coastal city known for Table Mountain, beaches, wineries, and vibrant culture.',
  'November to March',
  1200.00,
  FALSE,
  4,
  'Table Mountain',
  'English',
  'ZAR',
  'active'
),
(
  'Zanzibar',
  'Tanzania',
  'Zanzibar Urban West',
  'Africa',
  'An island destination known for spice farms, Stone Town, and beautiful beaches.',
  'June to October',
  950.00,
  TRUE,
  4,
  'Stone Town',
  'Swahili',
  'TZS',
  'active'
),
(
  'Marrakech',
  'Morocco',
  'Marrakech-Safi',
  'Africa',
  'A historic city famous for souks, palaces, gardens, and Jemaa el-Fnaa square.',
  'March to May',
  900.00,
  FALSE,
  3,
  'Jemaa el-Fnaa',
  'Arabic',
  'MAD',
  'active'
),
(
  'Cairo',
  'Egypt',
  'Cairo Governorate',
  'Africa',
  'The capital of Egypt, located near the Pyramids of Giza and the Nile River.',
  'October to April',
  1000.00,
  TRUE,
  3,
  'Pyramids of Giza',
  'Arabic',
  'EGP',
  'active'
),
(
  'Nairobi',
  'Kenya',
  'Nairobi County',
  'Africa',
  'Kenya''s capital city, known for its national park, museums, and wildlife access.',
  'June to March',
  1100.00,
  TRUE,
  3,
  'Nairobi National Park',
  'English',
  'KES',
  'active'
),
(
  'Port Louis',
  'Mauritius',
  'Port Louis',
  'Africa',
  'The capital of Mauritius, offering markets, museums, coastal views, and gateway beaches.',
  'April to June',
  1400.00,
  FALSE,
  4,
  'Caudan Waterfront',
  'English',
  'MUR',
  'active'
),
(
  'Victoria',
  'Seychelles',
  'Mahé',
  'Africa',
  'The capital of Seychelles, surrounded by beaches, hills, and tropical landscapes.',
  'April to May',
  1800.00,
  FALSE,
  4,
  'Sir Selwyn Clarke Market',
  'English',
  'SCR',
  'active'
),
(
  'Dubai',
  'United Arab Emirates',
  'Dubai',
  'Asia',
  'A modern global city known for luxury shopping, skyscrapers, and desert adventures.',
  'November to March',
  1500.00,
  TRUE,
  5,
  'Burj Khalifa',
  'Arabic',
  'AED',
  'active'
),
(
  'Istanbul',
  'Turkey',
  'Marmara',
  'Europe',
  'A transcontinental city famous for Hagia Sophia, Blue Mosque, bazaars, and Bosphorus views.',
  'April to May',
  1100.00,
  TRUE,
  4,
  'Hagia Sophia',
  'Turkish',
  'TRY',
  'active'
);
