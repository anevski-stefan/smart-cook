-- Add servings column to meals table
ALTER TABLE meals ADD COLUMN IF NOT EXISTS servings INTEGER DEFAULT 4;

-- Update existing meals to have a default number of servings
UPDATE meals SET servings = 4 WHERE servings IS NULL; 