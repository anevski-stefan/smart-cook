create table public.meals (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    title text not null,
    description text,
    type text check (type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
    nutritional_info jsonb default '{}'::jsonb,
    scheduled_for timestamp with time zone
);

-- Set up Row Level Security (RLS)
alter table public.meals enable row level security;

-- Create policies
create policy "Users can view their own meals"
    on public.meals for select
    using (auth.uid() = user_id);

create policy "Users can insert their own meals"
    on public.meals for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own meals"
    on public.meals for update
    using (auth.uid() = user_id);

create policy "Users can delete their own meals"
    on public.meals for delete
    using (auth.uid() = user_id);

-- Create indexes
create index meals_user_id_idx on public.meals(user_id);
create index meals_type_idx on public.meals(type);
create index meals_scheduled_for_idx on public.meals(scheduled_for); 