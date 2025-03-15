-- Add cooking_time column to meals table
ALTER TABLE meals ADD COLUMN IF NOT EXISTS cooking_time INTEGER DEFAULT 30;

-- Update existing meals to have a default cooking time
UPDATE meals SET cooking_time = 30 WHERE cooking_time IS NULL; 