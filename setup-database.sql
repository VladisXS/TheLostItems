-- Lost & Found Database Setup Script for Clonfert College
-- Run this script in PostgreSQL to initialize the database

-- Create database
CREATE DATABASE lost_found_db;

-- Connect to the database
\c lost_found_db

-- Create items table
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date_found DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_date ON items(date_found);

-- Sample data (optional - comment out if not needed)
INSERT INTO items (name, description, date_found, image_url) VALUES
('Black Nike Hoodie', 'Found near the gym on Monday morning. Size M. In good condition.', '2024-04-15', 'https://via.placeholder.com/300x200?text=Black+Nike+Hoodie'),
('Blue Backpack', 'Found in the library. Contains some notebooks inside.', '2024-04-14', 'https://via.placeholder.com/300x200?text=Blue+Backpack'),
('Silver Watch', 'Found near the cafeteria. Working condition. No visible damage.', '2024-04-13', 'https://via.placeholder.com/300x200?text=Silver+Watch'),
('Pair of Glasses', 'Black framed glasses found in the computer lab. Has a case.', '2024-04-12', 'https://via.placeholder.com/300x200?text=Black+Glasses'),
('Mobile Phone Case', 'Red phone case with floral pattern. Found at reception desk.', '2024-04-11', 'https://via.placeholder.com/300x200?text=Phone+Case');

-- Display the items
SELECT * FROM items;
