-- ============================================================================
-- Ledgerhall School Management — demo auth users
-- Run LAST: schema.sql -> seed.sql -> policies.sql -> seed_demo_users.sql
--
-- Creates 4 demo logins. Emails/passwords are demo-only credentials; they
-- live in the database (never in frontend code):
--   admin@ledgerhall.in   / admin1234   (admin)
--   student@ledgerhall.in / student123  (student STU-2026-0142)
--   teacher@ledgerhall.in / teacher123  (teacher TCH-001)
--   parent@ledgerhall.in  / parent123   (parent of STU-2026-0142)
--
-- The handle_new_user() trigger from schema.sql creates profiles and links
-- the student/teacher/parent rows from user_metadata.
-- Re-runnable (fixed UUIDs, on conflict do nothing).
-- ============================================================================

-- password hashing helper; resolves crypt()/gen_salt() from public or extensions
create or replace function public.demo_hash(p_password text)
returns text
language sql
set search_path = public, extensions, pg_temp
as $$
  select crypt(p_password, gen_salt('bf'));
$$;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'admin@ledgerhall.in', public.demo_hash('admin1234'), now(),
   '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
   '{"full_name":"System Administrator"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'student@ledgerhall.in', public.demo_hash('student123'), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"student","student_id":"STU-2026-0142","full_name":"Aarav Krishnan","class_name":"Class 8","section":"B","dob":"2011-04-12","gender":"Male","parent_name":"Suresh Krishnan","contact":"+91 98765 43210"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'teacher@ledgerhall.in', public.demo_hash('teacher123'), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"teacher","teacher_id":"TCH-001","full_name":"Dr. Priya Ramachandran","department":"Sciences","subjects":"Physics,Chemistry","contact":"+91 98765 11001","email":"priya.r@ledgerhall.in"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
   'parent@ledgerhall.in', public.demo_hash('parent123'), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"role":"parent","student_id":"STU-2026-0142","full_name":"Suresh Krishnan"}'::jsonb, now(), now())
on conflict (id) do nothing;

-- email provider identities (schema differs between GoTrue versions; optional)
do $$
begin
  insert into auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), u.id, 'email', u.email::text,
         jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
         now(), now(), now()
  from auth.users u
  where u.email in ('admin@ledgerhall.in', 'student@ledgerhall.in', 'teacher@ledgerhall.in', 'parent@ledgerhall.in')
    and not exists (
      select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
    );
exception when others then
  raise notice 'auth.identities insert skipped: %', sqlerrm;
end;
$$;
