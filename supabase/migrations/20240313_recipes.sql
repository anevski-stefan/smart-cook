-- Create recipes table
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  description text,
  instructions text[] not null,
  ingredients jsonb not null,
  cooking_time interval,
  servings integer,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  cuisine_type text,
  dietary_restrictions text[],
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.recipes enable row level security;

-- Recipes policies
create policy "Anyone can view recipes"
  on public.recipes for select
  using (true);

create policy "Users can create recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger handle_recipes_updated_at
  before update on public.recipes
  for each row
  execute function public.handle_updated_at(); 