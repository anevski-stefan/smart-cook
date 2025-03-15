-- Drop all functions with CASCADE to ensure all dependent objects are dropped
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_meals_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_record(uuid, text) CASCADE;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.user_ingredients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  quantity numeric,
  unit text,
  expiry_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.shopping_list (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  amount numeric not null,
  unit text not null,
  checked boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.chats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null default 'New Chat',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  type text check (type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  ingredients jsonb default '[]'::jsonb,
  instructions jsonb default '[]'::jsonb,
  nutritional_info jsonb default '{}'::jsonb,
  cooking_time integer default 30,
  servings integer default 4,
  scheduled_for timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create functions
-- 1. Handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Handle updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update meals updated_at function
CREATE OR REPLACE FUNCTION public.update_meals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create all triggers
-- 1. Auth user created trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Users updated_at trigger
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. User ingredients updated_at trigger
CREATE TRIGGER handle_user_ingredients_updated_at
  BEFORE UPDATE ON public.user_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Shopping list updated_at trigger
CREATE TRIGGER handle_shopping_list_updated_at
  BEFORE UPDATE ON public.shopping_list
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Chats updated_at trigger
CREATE TRIGGER handle_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Meals updated_at trigger
CREATE TRIGGER update_meals_updated_at_trigger
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION update_meals_updated_at(); 