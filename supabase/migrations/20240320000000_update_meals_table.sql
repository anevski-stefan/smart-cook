-- Add ingredients and instructions columns to meals table
alter table public.meals
add column ingredients jsonb default '[]'::jsonb,
add column instructions jsonb default '[]'::jsonb;

-- Update existing meals to have empty arrays for ingredients and instructions
update public.meals
set ingredients = '[]'::jsonb,
    instructions = '[]'::jsonb
where ingredients is null or instructions is null; 