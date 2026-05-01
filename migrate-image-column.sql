-- Migration script to update image_url column to support base64 images
-- This script will expand the image_url column from VARCHAR(500) to TEXT
-- to support compressed base64-encoded images (~680 bytes per image)

-- Connect to lost_found_db first:
-- \c lost_found_db

-- Alter the items table to change image_url column type
ALTER TABLE items 
ALTER COLUMN image_url TYPE TEXT;

-- Verify the change
\d items

-- Display confirmation
SELECT 'Migration completed: image_url column updated to TEXT type' AS status;
