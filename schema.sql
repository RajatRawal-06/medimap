-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Hospitals Table
create table if not exists public.hospitals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  image_url text,
  created_at timestamptz default now()
);

-- Departments Table
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references public.hospitals(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Doctors Table
create table if not exists public.doctors (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references public.hospitals(id) on delete cascade not null,
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  specialization text,
  experience_years integer,
  availability_status text default 'available',
  image_url text,
  created_at timestamptz default now()
);

-- Appointments Table
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  appointment_date date not null,
  appointment_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now()
);

-- Reviews Table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now()
);

-- Floor Maps Table
create table if not exists public.floor_maps (
  id uuid primary key default uuid_generate_v4(),
  hospital_id uuid references public.hospitals(id) on delete cascade not null,
  floor_level integer not null,
  image_url text not null,
  created_at timestamptz default now()
);

-- Navigation Nodes Table
create table if not exists public.navigation_nodes (
  id uuid primary key default uuid_generate_v4(),
  floor_map_id uuid references public.floor_maps(id) on delete cascade not null,
  x_coordinate float not null,
  y_coordinate float not null,
  label text,
  type text default 'path' check (type in ('path', 'room', 'elevator', 'stairs', 'exit')),
  created_at timestamptz default now()
);

-- Navigation Edges Table
create table if not exists public.navigation_edges (
  id uuid primary key default uuid_generate_v4(),
  from_node_id uuid references public.navigation_nodes(id) on delete cascade not null,
  to_node_id uuid references public.navigation_nodes(id) on delete cascade not null,
  distance float,
  created_at timestamptz default now(),
  constraint check_distinct_nodes check (from_node_id <> to_node_id)
);

-- Performance Indexes
create index if not exists idx_departments_hospital_id on public.departments(hospital_id);
create index if not exists idx_doctors_hospital_id on public.doctors(hospital_id);
create index if not exists idx_doctors_department_id on public.doctors(department_id);
create index if not exists idx_doctors_specialization on public.doctors(specialization);
create index if not exists idx_appointments_doctor_id on public.appointments(doctor_id);
create index if not exists idx_appointments_user_id on public.appointments(user_id);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_reviews_doctor_id on public.reviews(doctor_id);
create index if not exists idx_floor_maps_hospital_id on public.floor_maps(hospital_id);
create index if not exists idx_navigation_nodes_floor_map_id on public.navigation_nodes(floor_map_id);
create index if not exists idx_navigation_edges_from_node on public.navigation_edges(from_node_id);
create index if not exists idx_navigation_edges_to_node on public.navigation_edges(to_node_id);

-- Row Level Security (RLS)
alter table public.appointments enable row level security;
alter table public.reviews enable row level security;

-- RLS Policies
-- Appointments: Users can read/write their own
create policy "Users can view own appointments" on public.appointments for select using (auth.uid() = user_id);
create policy "Users can insert own appointments" on public.appointments for insert with check (auth.uid() = user_id);

-- Reviews: Public read, Authenticated write
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);
