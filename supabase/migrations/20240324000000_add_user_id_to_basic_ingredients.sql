-- Temporarily disable RLS to allow migration
ALTER TABLE basic_ingredients DISABLE ROW LEVEL SECURITY;

-- Add user_id column as nullable first
ALTER TABLE basic_ingredients
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Set user_id for existing records (if any) to a default user
UPDATE basic_ingredients
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE basic_ingredients
ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS
ALTER TABLE basic_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
ON basic_ingredients
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add specific policies for better granularity
-- Policy to allow users to select their own ingredients
CREATE POLICY "Users can view their own ingredients"
ON basic_ingredients
FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own ingredients
CREATE POLICY "Users can insert their own ingredients"
ON basic_ingredients
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own ingredients
CREATE POLICY "Users can update their own ingredients"
ON basic_ingredients
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own ingredients
CREATE POLICY "Users can delete their own ingredients"
ON basic_ingredients
FOR DELETE
USING (auth.uid() = user_id); 