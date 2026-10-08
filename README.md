# Ledgerhall — School Management System

A full-stack school management system built with React 19 + Vite + Tailwind CSS
(frontend) and **Supabase** (Auth + PostgreSQL + Row Level Security). There is no
custom server: the browser talks directly to Supabase through the typed API
modules in `src/api/`, and the database enforces every permission with RLS.

## Roles & portals

| Role    | Login access | Portal |
|---------|--------------|--------|
| Admin   | seeded account | `/admin` — students, teachers, attendance, exams, timetable, fees, reports, settings |
| Teacher | registered or seeded | `/teacher` — my classes, mark class attendance, enter exam results, my timetable, profile, self-attendance |
| Student | registered or seeded | `/student` — dashboard, timetable, attendance calendar, exams & results, fees, profile |
| Parent  | registered or seeded | `/parent` — child dashboard, attendance, fees (mark paid), exams, profile |

Demo accounts (created by `supabase/seed_demo_users.sql`):

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@ledgerhall.in     | admin1234   |
| Student | student@ledgerhall.in   | student123  |
| Teacher | teacher@ledgerhall.in   | teacher123  |
| Parent  | parent@ledgerhall.in    | parent123   |

## Getting started

```bash
npm install
cp .env.example .env    # then fill in your Supabase project values
npm run dev
```

Environment variables (see `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

If the env vars are missing the app still runs, but shows an honest
"Supabase is not configured" message instead of fake data.

### Database setup (Supabase SQL editor, in this order)

1. `supabase/schema.sql` — tables, indexes, triggers, helper functions
2. `supabase/policies.sql` — Row Level Security policies for every table
3. `supabase/seed.sql` — demo school data (students, teachers, exams, fees, timetable, settings)
4. `supabase/seed_demo_users.sql` — the 4 demo auth users above

Full setup details, registration rules, and RLS verification snippets are in
[`supabase/README.md`](supabase/README.md).

## How auth works

- Real `supabase.auth` sign-in / sign-up / password reset / OAuth (Google, Azure).
- A DB trigger (`handle_new_user`) creates the `profiles` row plus the linked
  student/teacher/parent row from signup metadata — student/teacher signups
  require an existing, unlinked Student ID / Teacher ID, so IDs can't be stolen.
- `src/context/AuthContext.jsx` enriches the session with the role-specific row
  (student/teacher record, or the parent's linked child) and routes by role via
  `portalFor()`.
- Admin accounts can only be created by the service role (seed SQL), never from
  the client.

## Security model

- **RLS on every table**: admins full access; students read/update only their own
  row; parents read only their linked child's attendance/exams/fees; teachers
  read students of their classes and write attendance/results; settings,
  timetable and exams are readable by all authenticated users.
- **DB triggers** block privilege escalation: non-admins cannot change
  `role`/`status`, students cannot change `class_name`/`section`/IDs, and fee
  rows can only be flipped to `Paid` (by the linked student/parent) — amounts
  and due dates are admin-only.
- Service-role keys are never shipped to the frontend; only the publishable key
  is used.

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # production build
npm run preview    # preview the build
npm test           # vitest (unit tests, Supabase mocked)
npm run test:watch # vitest watch mode
npm run format     # oxfmt
```

## Structure

```
supabase/
  schema.sql             Tables, indexes, triggers, SQL helper functions
  policies.sql           RLS policies for all 11 tables
  seed.sql               Demo school data translated from the original prototype
  seed_demo_users.sql    Demo auth users (hashed, fixed UUIDs)
  README.md              Setup guide, registration rules, verification snippets
src/
  lib/supabase.js        Client + isConfigured/configError helpers
  context/AuthContext.jsx  Real auth session, portalFor(), role routing
  api/
    students.js teachers.js attendance.js examinations.js
    fees.js timetable.js profiles.js settings.js
                        camelCase page ↔ snake_case DB mappers; every call
                        returns { data, error } and never fakes data
  components/            SealMark, auth/register UI, admin shell & modals
  pages/
    Login.jsx Register.jsx ResetPassword.jsx
    admin/    Dashboard, Students, Teachers, Attendance, Examinations,
              Timetable, Fees, Reports, Settings (all API-backed)
    student/  Dashboard, Timetable, Attendance, Examinations, Fees, Profile
    teacher/  Dashboard, MyClasses, Attendance, Examinations, Profile
    parent/   Dashboard, Attendance, Fees, Examinations, Profile
  data/       Option-list constants only (classes, subjects, fee types, …)
              — seed record arrays are no longer imported by any page
```

## Design direction

The UI keeps an "academic institution ledger" identity rather than a generic
SaaS look: deep ink-navy / royal-blue / muted-gold palette, `Fraunces` serif
headings with `Plus Jakarta Sans` body text, and the animated hexagonal
`SealMark` emblem as the brand mark. Fully responsive (single column on mobile,
split illustration + form on desktop for auth pages) and it respects
`prefers-reduced-motion`.

## Known limitations

- Live acceptance testing requires a real Supabase project; unit tests cover
  the API mappers/RLS-unconfigured paths with a mocked client.
- Parent registration links a child by Student ID; a parent who registers
  before the student exists sees an explicit "no linked student" state.
- GitHub Pages deployment keeps the `/Ledger_SchoolManagementSys/` base path —
  auth redirect URLs are derived from `location.origin + BASE_URL`.
