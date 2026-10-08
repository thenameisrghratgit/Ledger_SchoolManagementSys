# Supabase setup — Ledgerhall School Management

This folder contains the full database layer. Everything runs on plain
Supabase (Auth + Postgres + RLS). No other backend is used.

## Files (run in this order)

| # | File | Purpose |
|---|------|---------|
| 1 | `schema.sql` | Tables, FKs, indexes, constraints, helper functions, security triggers, `auth.users` signup trigger |
| 2 | `seed.sql` | Demo school data translated 1:1 from `src/data/*.js` (students, teachers, exams, fees, timetable) |
| 3 | `policies.sql` | Row Level Security policies for every table |
| 4 | `seed_demo_users.sql` | Four demo login accounts (admin / student / teacher / parent) |

## Setup steps

1. Create a project at https://supabase.com (free tier is fine).
2. In **Project Settings → API**, copy the project URL and the
   **publishable** (or anon) key.
3. In the project root of this repo, copy `.env.example` to `.env` and fill
   in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Open **SQL Editor → New query**, paste each file above **in order**, and
   press Run. (Or use the CLI: `supabase db push` / `psql` — any method that
   executes the files in order works.)
5. In **Authentication → Providers → Email**, keep Email enabled.
   - Disable "Confirm email" for instant demo logins, or leave it on and use
     the verification link (the app handles both).
   - For password recovery emails to work, set
     **Authentication → URL Configuration → Site URL** to your deployed URL
     (and add `**/auth/callback` / `**/auth/reset` redirect URLs).
6. Start the app: `npm run dev`, then log in with a demo account (below).

## Demo accounts

Created by `seed_demo_users.sql` (stored in the database, never in frontend
code):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ledgerhall.in` | `admin1234` |
| Student | `student@ledgerhall.in` | `student123` (Aarav, STU-2026-0142) |
| Teacher | `teacher@ledgerhall.in` | `teacher123` (Dr. Priya, TCH-001) |
| Parent | `parent@ledgerhall.in` | `parent123` (Suresh, linked to STU-2026-0142) |

Change or delete these before any real use.

## Registration roles

Self-signup supports **student**, **teacher** and **parent** only.
Admin accounts can only be created by an existing admin (or directly in the
SQL editor) — the signup trigger ignores `role: admin` coming from client
metadata, so it cannot be self-assigned.

- **Student signup** requires a unique Student ID (`STU-…`).
- **Teacher signup** requires a unique Teacher ID (`TCH-…`).
- **Parent signup** requires the child's Student ID. If no student with that
  ID exists, signup still succeeds but the parent portal shows a clear
  "no linked child" state; the link can be created later.

## Design notes

- Business IDs are primary keys (`students.student_id`, `teachers.teacher_id`,
  `examinations.id`, `fees.id`) so the UI needs no mapping layer.
- All security runs in the database: RLS policies + `security definer`
  helpers (no policy recursion) + `BEFORE UPDATE` triggers that stop
  non-admins from escalating `role`/`status` or editing key fields
  (`profiles`, `students`, `teachers`, `fees`).
- The frontend never holds a service-role key. Seeding `auth.users`
  (passwords hashed with bcrypt) is a database-only operation.

## Verifying RLS (optional quick test)

In the SQL editor, as an authenticated user (use "Make a user request" in
the SQL editor, or the app itself):

```sql
-- as the demo student, this must return only their own row
select student_id, name from public.students;
-- as the demo student, this must return 0 rows
select id, role from public.profiles where role = 'admin';
```

Automated client-side tests: `npm test` (unit tests; RLS/DB integration
tests are skipped unless `VITE_SUPABASE_URL` + a test key are provided).
