-- MyMedina Database Setup Script
-- Run this script to create the database and enable UUID extension

-- Create database (run this separately if needed)
-- CREATE DATABASE mymedina;

-- Connect to mymedina database first, then run:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify UUID extension is enabled
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- Test UUID generation
SELECT uuid_generate_v4();

