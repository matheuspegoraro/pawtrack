-- =============================================
-- PawTrack Database Schema
-- =============================================

-- Pets table
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  species text not null default 'dog',
  breed text,
  birth_date date,
  weight_lb decimal,
  photo_url text,
  chip_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Health records table
create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  type text not null check (type in ('vaccine', 'medication', 'vet_visit', 'symptom', 'weight')),
  title text not null,
  description text,
  date date not null,
  next_due_date date,
  dosage text,
  frequency text,
  vet_name text,
  vet_clinic text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reminders table
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  health_record_id uuid references public.health_records(id) on delete cascade,
  title text not null,
  remind_at timestamptz not null,
  repeat_interval interval,
  is_active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Push tokens for notifications
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null,
  platform text,
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

-- Shared access for family/pet sitters
create table public.shared_access (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  shared_with_email text not null,
  shared_with_id uuid references auth.users(id),
  role text not null default 'viewer' check (role in ('viewer', 'editor')),
  created_at timestamptz not null default now()
);

-- =============================================
-- Indexes
-- =============================================
create index idx_pets_user_id on public.pets(user_id);
create index idx_health_records_pet_id on public.health_records(pet_id);
create index idx_health_records_date on public.health_records(date desc);
create index idx_health_records_next_due on public.health_records(next_due_date) where next_due_date is not null;
create index idx_reminders_pet_id on public.reminders(pet_id);
create index idx_reminders_remind_at on public.reminders(remind_at) where is_active = true;
create index idx_push_tokens_user_id on public.push_tokens(user_id);
create index idx_shared_access_pet_id on public.shared_access(pet_id);
create index idx_shared_access_shared_with on public.shared_access(shared_with_id);

-- =============================================
-- Row Level Security
-- =============================================
alter table public.pets enable row level security;
alter table public.health_records enable row level security;
alter table public.reminders enable row level security;
alter table public.push_tokens enable row level security;
alter table public.shared_access enable row level security;

-- Helper: get pet IDs accessible to current user (own + shared)
create or replace function public.accessible_pet_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select id from public.pets where user_id = auth.uid()
  union
  select pet_id from public.shared_access where shared_with_id = auth.uid()
$$;

-- Pets policies
create policy "Users can view own pets"
  on public.pets for select
  using (user_id = auth.uid() or id in (select pet_id from public.shared_access where shared_with_id = auth.uid()));

create policy "Users can create own pets"
  on public.pets for insert
  with check (user_id = auth.uid());

create policy "Users can update own pets"
  on public.pets for update
  using (user_id = auth.uid());

create policy "Users can delete own pets"
  on public.pets for delete
  using (user_id = auth.uid());

-- Health records policies
create policy "Users can view records of accessible pets"
  on public.health_records for select
  using (pet_id in (select public.accessible_pet_ids()));

create policy "Users can create records for own pets"
  on public.health_records for insert
  with check (pet_id in (select id from public.pets where user_id = auth.uid()));

create policy "Users can update records for own pets"
  on public.health_records for update
  using (pet_id in (select id from public.pets where user_id = auth.uid()));

create policy "Users can delete records for own pets"
  on public.health_records for delete
  using (pet_id in (select id from public.pets where user_id = auth.uid()));

-- Reminders policies
create policy "Users can view reminders of accessible pets"
  on public.reminders for select
  using (pet_id in (select public.accessible_pet_ids()));

create policy "Users can create reminders for own pets"
  on public.reminders for insert
  with check (pet_id in (select id from public.pets where user_id = auth.uid()));

create policy "Users can update reminders for own pets"
  on public.reminders for update
  using (pet_id in (select id from public.pets where user_id = auth.uid()));

create policy "Users can delete reminders for own pets"
  on public.reminders for delete
  using (pet_id in (select id from public.pets where user_id = auth.uid()));

-- Push tokens policies
create policy "Users manage own push tokens"
  on public.push_tokens for all
  using (user_id = auth.uid());

-- Shared access policies
create policy "Owners can manage sharing"
  on public.shared_access for all
  using (owner_id = auth.uid());

create policy "Shared users can view their access"
  on public.shared_access for select
  using (shared_with_id = auth.uid());

-- =============================================
-- Updated_at trigger
-- =============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_pets_updated_at
  before update on public.pets
  for each row execute function public.handle_updated_at();

create trigger set_health_records_updated_at
  before update on public.health_records
  for each row execute function public.handle_updated_at();

-- =============================================
-- Storage bucket for pet photos
-- =============================================
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true);

create policy "Users can upload pet photos"
  on storage.objects for insert
  with check (bucket_id = 'pet-photos' and auth.uid() is not null);

create policy "Anyone can view pet photos"
  on storage.objects for select
  using (bucket_id = 'pet-photos');

create policy "Users can delete own pet photos"
  on storage.objects for delete
  using (bucket_id = 'pet-photos' and auth.uid() is not null);
