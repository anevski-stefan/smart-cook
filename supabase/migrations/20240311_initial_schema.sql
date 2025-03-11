-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create saved_recipes table
create table public.saved_recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  recipe_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, recipe_id)
);

-- Create user_ingredients table
create table public.user_ingredients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  quantity numeric,
  unit text,
  expiry_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create recipe_ratings table
create table public.recipe_ratings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  recipe_id text not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, recipe_id)
);

-- Create shopping_list table
create table public.shopping_list (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  amount numeric not null,
  unit text not null,
  checked boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.saved_recipes enable row level security;
alter table public.user_ingredients enable row level security;
alter table public.recipe_ratings enable row level security;
alter table public.shopping_list enable row level security;

-- Users policies
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

-- Saved recipes policies
create policy "Users can view their own saved recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can save recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);

-- User ingredients policies
create policy "Users can view their own ingredients"
  on public.user_ingredients for select
  using (auth.uid() = user_id);

create policy "Users can manage their ingredients"
  on public.user_ingredients for all
  using (auth.uid() = user_id);

-- Recipe ratings policies
create policy "Anyone can view recipe ratings"
  on public.recipe_ratings for select
  using (true);

create policy "Users can manage their own ratings"
  on public.recipe_ratings for all
  using (auth.uid() = user_id);

-- Shopping list policies
create policy "Users can view their own shopping list"
  on public.shopping_list for select
  using (auth.uid() = user_id);

create policy "Users can manage their shopping list"
  on public.shopping_list for all
  using (auth.uid() = user_id);

-- Create functions
create or replace function public.get_recipe_average_rating(recipe_id text)
returns numeric as $$
  select coalesce(avg(rating)::numeric(3,2), 0)
  from public.recipe_ratings
  where recipe_ratings.recipe_id = $1;
$$ language sql security definer;

-- Create triggers for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to relevant tables
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger handle_user_ingredients_updated_at
  before update on public.user_ingredients
  for each row
  execute function public.handle_updated_at();

create trigger handle_recipe_ratings_updated_at
  before update on public.recipe_ratings
  for each row
  execute function public.handle_updated_at();

create trigger handle_shopping_list_updated_at
  before update on public.shopping_list
  for each row
  execute function public.handle_updated_at(); 