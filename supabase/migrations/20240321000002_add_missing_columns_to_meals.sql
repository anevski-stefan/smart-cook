-- Add missing columns to meals table
ALTER TABLE meals 
  ADD COLUMN IF NOT EXISTS cooking_time INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS servings INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing meals to have default values
UPDATE meals SET 
  cooking_time = 30 WHERE cooking_time IS NULL;
UPDATE meals SET 
  servings = 4 WHERE servings IS NULL;
UPDATE meals SET 
  created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE meals SET 
  updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meals_updated_at_trigger ON meals;
CREATE TRIGGER update_meals_updated_at_trigger
  BEFORE UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_meals_updated_at(); 