-- ============================================================================
-- Ledgerhall School Management — Supabase schema
-- Run in order: schema.sql -> seed.sql -> policies.sql
-- (see supabase/README.md for full setup instructions)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'student', 'teacher', 'parent')),
  full_name text,
  phone text,
  avatar_url text,
  status text not null default 'approved' check (status in ('approved', 'pending', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  student_id text primary key,
  auth_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  email text,
  roll_number text,
  dob date,
  gender text check (gender in ('Male', 'Female', 'Other', 'Prefer not to say')),
  class_name text not null,
  section text not null default 'A',
  parent_name text,
  parent_contact text,
  contact text,
  address text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teachers (
  teacher_id text primary key,
  auth_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  department text,
  qualification text,
  subjects text[] not null default '{}',
  contact text,
  email text,
  experience text,
  classes text,
  status text not null default 'Active' check (status in ('Active', 'On Leave', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parent_student (
  parent_id uuid not null references public.profiles (id) on delete cascade,
  student_id text not null references public.students (student_id) on delete cascade,
  relation text,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public.students (student_id) on delete cascade,
  date date not null,
  status text not null check (status in ('P', 'A', 'L')),
  notes text,
  marked_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create table public.examinations (
  id text primary key,
  name text not null,
  type text not null check (type in ('Unit Test', 'Mid-term', 'Final', 'Pre-board', 'Practice')),
  subject text not null,
  class_name text not null,
  date date not null,
  time text,
  duration text,
  room text,
  max_marks int not null default 100 check (max_marks > 0),
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Ongoing', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id text not null references public.examinations (id) on delete cascade,
  student_id text not null references public.students (student_id) on delete cascade,
  marks numeric(6, 2) check (marks >= 0),
  grade text,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, student_id)
);

create table public.fees (
  id text primary key,
  student_id text not null references public.students (student_id) on delete cascade,
  type text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  due_date date not null,
  paid_date date,
  status text not null default 'Pending' check (status in ('Paid', 'Pending', 'Overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_id text not null references public.teachers (teacher_id) on delete cascade,
  date date not null,
  status text not null check (status in ('P', 'A', 'L')),
  created_at timestamptz not null default now(),
  unique (teacher_id, date)
);

create table public.timetable (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  day text not null check (day in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  period_index int not null check (period_index between 1 and 8),
  subject text not null,
  teacher_name text,
  created_at timestamptz not null default now(),
  unique (class_name, day, period_index)
);

create table public.school_settings (
  id int primary key check (id = 1),
  school_name text not null default 'Ledgerhall Public School',
  address text,
  phone text,
  email text,
  academic_year text,
  currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Helpers (security definer so policies can call them without RLS recursion)
-- ----------------------------------------------------------------------------

create or replace function public.app_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.app_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.app_is_parent_of(p_student_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.parent_student
    where parent_id = auth.uid() and student_id = p_student_id
  );
$$;

create or replace function public.app_is_self_student(p_student_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.students
    where student_id = p_student_id and auth_id = auth.uid()
  );
$$;

create or replace function public.app_is_self_teacher(p_teacher_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.teachers
    where teacher_id = p_teacher_id and auth_id = auth.uid()
  );
$$;

create or replace function public.app_linked_student_ids()
returns setof text
language sql
security definer
set search_path = public
stable
as $$
  select student_id from public.parent_student where parent_id = auth.uid();
$$;

create or replace function public.app_my_student_id()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select student_id from public.students where auth_id = auth.uid();
$$;

create or replace function public.app_my_teacher_id()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select teacher_id from public.teachers where auth_id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

create index idx_students_class on public.students (class_name, section);
create index idx_students_auth on public.students (auth_id);
create index idx_teachers_auth on public.teachers (auth_id);
create index idx_attendance_date on public.attendance (date);
create index idx_attendance_student on public.attendance (student_id);
create index idx_examinations_class on public.examinations (class_name);
create index idx_examinations_date on public.examinations (date);
create index idx_exam_results_student on public.exam_results (student_id);
create index idx_exam_results_exam on public.exam_results (exam_id);
create index idx_fees_student on public.fees (student_id);
create index idx_fees_status on public.fees (status);
create index idx_teacher_attendance_date on public.teacher_attendance (date);
create index idx_timetable_class on public.timetable (class_name, day);
create index idx_parent_student_student on public.parent_student (student_id);
create index idx_profiles_role on public.profiles (role);

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_students_updated_at before update on public.students
  for each row execute function public.set_updated_at();
create trigger trg_teachers_updated_at before update on public.teachers
  for each row execute function public.set_updated_at();
create trigger trg_examinations_updated_at before update on public.examinations
  for each row execute function public.set_updated_at();
create trigger trg_exam_results_updated_at before update on public.exam_results
  for each row execute function public.set_updated_at();
create trigger trg_fees_updated_at before update on public.fees
  for each row execute function public.set_updated_at();
create trigger trg_school_settings_updated_at before update on public.school_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Profile security: block role/status escalation by non-admins
-- ----------------------------------------------------------------------------

create or replace function public.enforce_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- no JWT context: signup trigger / service role / postgres (trusted)
  if auth.uid() is null then
    return new;
  end if;
  if public.app_is_admin() then
    return new;
  end if;
  -- non-admins may update their own profile, but never role or status
  if new.id <> auth.uid() then
    raise exception 'Not allowed to update this profile';
  end if;
  if new.role is distinct from old.role or new.status is distinct from old.status then
    raise exception 'Profile role/status can only be changed by an administrator';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_security before update on public.profiles
  for each row execute function public.enforce_profile_update();

-- Non-admins may edit their own record but never identity/key fields
create or replace function public.enforce_student_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.app_is_admin() then
    return new;
  end if;
  if new.student_id is distinct from old.student_id
     or new.auth_id is distinct from old.auth_id
     or new.class_name is distinct from old.class_name
     or new.section is distinct from old.section
     or new.status is distinct from old.status then
    raise exception 'Only administrators can change these student fields';
  end if;
  return new;
end;
$$;

create trigger trg_students_security before update on public.students
  for each row execute function public.enforce_student_update();

create or replace function public.enforce_teacher_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.app_is_admin() then
    return new;
  end if;
  if new.teacher_id is distinct from old.teacher_id
     or new.auth_id is distinct from old.auth_id
     or new.status is distinct from old.status then
    raise exception 'Only administrators can change these teacher fields';
  end if;
  return new;
end;
$$;

create trigger trg_teachers_security before update on public.teachers
  for each row execute function public.enforce_teacher_update();

-- Non-admins (parents paying a fee) may only change status / paid_date
create or replace function public.enforce_fees_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.app_is_admin() then
    return new;
  end if;
  if new.id is distinct from old.id
     or new.student_id is distinct from old.student_id
     or new.type is distinct from old.type
     or new.amount is distinct from old.amount
     or new.due_date is distinct from old.due_date then
    raise exception 'Only administrators can change these fee fields';
  end if;
  if new.status is distinct from old.status and new.status <> 'Paid' then
    raise exception 'Only administrators can change fee status';
  end if;
  if new.paid_date is distinct from old.paid_date and new.paid_date is null then
    raise exception 'Payment date cannot be cleared';
  end if;
  return new;
end;
$$;

create trigger trg_fees_security before update on public.fees
  for each row execute function public.enforce_fees_update();

-- ----------------------------------------------------------------------------
-- Auth trigger: create profile (+ student/teacher/parent rows) on signup
-- role resolution: service-role app_metadata may set any role; client
-- user_metadata may only request student / teacher / parent (never admin).
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_app_meta jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  v_student_id text;
  v_teacher_id text;
  v_student_exists boolean;
begin
  v_role := nullif(v_app_meta ->> 'role', '');
  if v_role is null or v_role not in ('admin', 'student', 'teacher', 'parent') then
    v_role := nullif(v_meta ->> 'role', '');
    if v_role is null or v_role not in ('student', 'teacher', 'parent') then
      v_role := 'student';
    end if;
  end if;

  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    v_role,
    coalesce(nullif(v_meta ->> 'full_name', ''), nullif(new.email, '')),
    nullif(v_meta ->> 'phone', '')
  )
  on conflict (id) do nothing;

  if v_role = 'student' then
    v_student_id := nullif(v_meta ->> 'student_id', '');
    if v_student_id is null then
      raise exception 'Student ID is required to register as a student';
    end if;
    if exists (select 1 from public.students where student_id = v_student_id) then
      -- adopt a pre-created (unlinked) record; never steal a linked one
      update public.students
        set auth_id = new.id
        where student_id = v_student_id and auth_id is null;
      if not found then
        if (select auth_id from public.students where student_id = v_student_id) is distinct from new.id then
          raise exception 'Student ID % is already registered to another account', v_student_id;
        end if;
      end if;
    else
      insert into public.students (student_id, auth_id, name, roll_number, class_name, section, dob, gender, parent_name, parent_contact, contact, address)
      values (
        v_student_id,
        new.id,
        coalesce(nullif(v_meta ->> 'full_name', ''), v_student_id),
        nullif(v_meta ->> 'roll_number', ''),
        coalesce(nullif(v_meta ->> 'class_name', ''), 'Unassigned'),
        coalesce(nullif(v_meta ->> 'section', ''), 'A'),
        nullif(v_meta ->> 'dob', '')::date,
        nullif(v_meta ->> 'gender', ''),
        nullif(v_meta ->> 'parent_name', ''),
        nullif(v_meta ->> 'parent_contact', ''),
        coalesce(nullif(v_meta ->> 'contact', ''), nullif(new.email, '')),
        nullif(v_meta ->> 'address', '')
      );
    end if;
  elsif v_role = 'teacher' then
    v_teacher_id := nullif(v_meta ->> 'teacher_id', '');
    if v_teacher_id is null then
      raise exception 'Teacher ID is required to register as a teacher';
    end if;
    if exists (select 1 from public.teachers where teacher_id = v_teacher_id) then
      update public.teachers
        set auth_id = new.id
        where teacher_id = v_teacher_id and auth_id is null;
      if not found then
        if (select auth_id from public.teachers where teacher_id = v_teacher_id) is distinct from new.id then
          raise exception 'Teacher ID % is already registered to another account', v_teacher_id;
        end if;
      end if;
    else
      insert into public.teachers (teacher_id, auth_id, name, department, qualification, subjects, contact, email)
      values (
        v_teacher_id,
        new.id,
        coalesce(nullif(v_meta ->> 'full_name', ''), v_teacher_id),
        nullif(v_meta ->> 'department', ''),
        nullif(v_meta ->> 'qualification', ''),
        case when v_meta ->> 'subjects' is null or v_meta ->> 'subjects' = ''
             then '{}'::text[]
             else string_to_array(v_meta ->> 'subjects', ',')
        end,
        coalesce(nullif(v_meta ->> 'contact', ''), nullif(new.email, '')),
        coalesce(nullif(v_meta ->> 'email', ''), new.email)
      );
    end if;
  elsif v_role = 'parent' then
    v_student_id := nullif(v_meta ->> 'student_id', '');
    if v_student_id is not null then
      select exists (select 1 from public.students where student_id = v_student_id)
        into v_student_exists;
      -- link only when the student exists; otherwise the parent portal
      -- shows a clear "no linked child" error instead of failing signup
      if v_student_exists then
        insert into public.parent_student (parent_id, student_id, relation)
        values (new.id, v_student_id, nullif(v_meta ->> 'relation', ''))
        on conflict do nothing;
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Single settings row seed (data seed lives in seed.sql)
-- ----------------------------------------------------------------------------

insert into public.school_settings (id) values (1)
on conflict (id) do nothing;
