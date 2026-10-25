-- Run this file in the Supabase SQL Editor for the Ride Clinic project.
-- Then create an account on the site and run the admin assignment statement
-- at the bottom with the owner's sign-up email.

create extension if not exists pgcrypto;

create table if not exists public.ride_clinic_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.ride_clinic_booking_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  scooter_name text not null check (char_length(scooter_name) between 1 and 100),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists ride_clinic_booking_requests_created_at_idx
  on public.ride_clinic_booking_requests (created_at desc);

create index if not exists ride_clinic_booking_requests_user_id_idx
  on public.ride_clinic_booking_requests (user_id);

create or replace function public.ride_clinic_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.ride_clinic_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.ride_clinic_is_admin() from public, anon;
grant execute on function public.ride_clinic_is_admin() to authenticated;

alter table public.ride_clinic_admins enable row level security;
alter table public.ride_clinic_booking_requests enable row level security;

drop policy if exists "Users can read their own admin role"
  on public.ride_clinic_admins;
create policy "Users can read their own admin role"
  on public.ride_clinic_admins
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Customers and admins can read requests"
  on public.ride_clinic_booking_requests;
create policy "Customers and admins can read requests"
  on public.ride_clinic_booking_requests
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.ride_clinic_is_admin())
  );

drop policy if exists "Customers can submit their own requests"
  on public.ride_clinic_booking_requests;
create policy "Customers can submit their own requests"
  on public.ride_clinic_booking_requests
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Admins can update request status"
  on public.ride_clinic_booking_requests;
create policy "Admins can update request status"
  on public.ride_clinic_booking_requests
  for update to authenticated
  using ((select public.ride_clinic_is_admin()))
  with check ((select public.ride_clinic_is_admin()));

revoke all on public.ride_clinic_admins from anon, authenticated;
grant select on public.ride_clinic_admins to authenticated;

revoke all on public.ride_clinic_booking_requests from anon, authenticated;
grant select, insert on public.ride_clinic_booking_requests to authenticated;
grant update (status) on public.ride_clinic_booking_requests to authenticated;

-- After the owner creates an account on the website, replace the email below
-- with that account's email and run this statement to grant admin access.
insert into public.ride_clinic_admins (user_id)
select id
from auth.users
where lower(email) = lower('aayanslam981@gmail.com')
on conflict (user_id) do nothing;
