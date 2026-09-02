# Plan: Multi-Role Portals + Backend Integration

## Context
The admin panel is complete. The next step is building three more role-based portals (Student, Teacher, Parent) that mirror the admin's design language, then wiring all four roles to a real database so data persists and each user sees only their own records.

Currently the app is a 100% front-end React SPA — all data lives in static in-memory seed arrays with no HTTP client, no backend, and no environment variables.

---

## Recommended Backend: Supabase

**Why Supabase:**
- Hosted PostgreSQL — no separate server to run or deploy alongside the Figma Make preview
- Built-in Auth with roles/metadata (admin / teacher / student / parent)
- Row Level Security (RLS) — enforced at the DB layer so each user automatically sees only their own records
- Auto-generated REST API consumed directly from React; no custom backend code needed
- Free tier is more than sufficient for this school management system
- The existing seed data shapes map cleanly to Postgres tables

---

## Phase 1 — Database Schema (Supabase)

Tables to create (match existing seed data shapes + add auth linkage):

| Table | Key columns |
|---|---|
| `profiles` | `id` (FK → auth.users), `role` (admin/teacher/student/parent), `name`, `email` |
| `students` | `student_id PK`, `auth_id FK`, `name`, `dob`, `gender`, `class_name`, `section`, `parent_name`, `contact`, `address` |
| `teachers` | `teacher_id PK`, `auth_id FK`, `name`, `department`, `subjects[]`, `contact`, `email`, `experience`, `classes`, `status` |
| `parents` | `parent_id PK`, `auth_id FK`, `name`, `contact`, `email`, linked to `students` via `parent_student` join table |
| `attendance` | `id`, `student_id FK`, `date`, `class_name`, `status` (P/A/L), `marked_by` (teacher_id) |
| `examinations` | mirrors existing seed shape + `results` subtable (`exam_id`, `student_id`, `marks_obtained`) |
| `fees` | mirrors existing seed shape |
| `timetable` | `class_name`, `day`, `period_index`, `subject`, `teacher_id` |

RLS policies ensure:
- Students read only their own records
- Teachers read/write for classes they are assigned
- Parents read only their linked child's records
- Admins have full access

---

## Phase 2 — Auth Overhaul

**File: `src/context/AuthContext.jsx`** — complete rewrite

Current: single hardcoded admin credential, sessionStorage only, no roles.

New:
- Use `@supabase/supabase-js` — `supabase.auth.signInWithPassword()` / `signOut()`
- On login, fetch the user's `profiles` row to get `role` and `name`
- `user` object: `{ id, email, role, name, ...role-specific fields }`
- Session managed by Supabase SDK (persists in localStorage automatically)
- `login(email, password)` → returns `{ ok, error }`
- `register(email, password, role, profileData)` → creates auth user + inserts profile row

**File: `src/components/admin/ProtectedRoute.jsx`** — add `allowedRoles` prop

```jsx
// Current: only checks isAuthenticated
// New:
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from }} />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />
  return children
}
```

---

## Phase 3 — API Layer

**New file: `src/lib/supabase.js`** — Supabase client singleton
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
```

**New folder: `src/api/`** — one file per domain, each exporting async CRUD functions that call `supabase.from(...)`:
- `src/api/students.js`
- `src/api/teachers.js`
- `src/api/attendance.js`
- `src/api/examinations.js`
- `src/api/fees.js`
- `src/api/timetable.js`

Existing admin pages (`Students.jsx`, `Teachers.jsx`, etc.) will be updated to call these API functions instead of importing from `src/data/`. The UI code stays the same — only the data source changes.

---

## Phase 4 — Three New Portals

Each portal follows the exact same layout pattern as Admin: a Layout component (sidebar + topbar) wrapped by `ProtectedRoute`, with `<Outlet />` child pages.

### Student Portal (`/student/...`)

New files:
- `src/components/student/StudentLayout.jsx` — sidebar nav, same glider design
- `src/components/student/StudentSidebar.jsx`
- `src/pages/student/Dashboard.jsx` — welcome card, today's schedule snippet, attendance rate, upcoming exams
- `src/pages/student/Timetable.jsx` — read-only view of their class timetable
- `src/pages/student/Attendance.jsx` — their own attendance history, month-by-month calendar view
- `src/pages/student/Examinations.jsx` — upcoming exams + results (marks obtained, grade)
- `src/pages/student/Fees.jsx` — their fee records + payment status
- `src/pages/student/Profile.jsx` — view/edit own profile

Nav items: Dashboard, Timetable, Attendance, Examinations, Fees, Profile

### Teacher Portal (`/teacher/...`)

New files:
- `src/components/teacher/TeacherLayout.jsx`
- `src/components/teacher/TeacherSidebar.jsx`
- `src/pages/teacher/Dashboard.jsx` — today's periods, class summary, pending attendance
- `src/pages/teacher/MyClasses.jsx` — their assigned timetable slots
- `src/pages/teacher/Attendance.jsx` — mark attendance for their classes (reuses Attendance page logic)
- `src/pages/teacher/Examinations.jsx` — exams they are assigned to, enter results
- `src/pages/teacher/Profile.jsx`

Nav items: Dashboard, My Classes, Attendance, Examinations, Profile

### Parent Portal (`/parent/...`)

New files:
- `src/components/parent/ParentLayout.jsx`
- `src/components/parent/ParentSidebar.jsx`
- `src/pages/parent/Dashboard.jsx` — child summary card, attendance rate, upcoming fees/exams
- `src/pages/parent/Attendance.jsx` — child's attendance by month
- `src/pages/parent/Fees.jsx` — child's fee records
- `src/pages/parent/Examinations.jsx` — child's upcoming exams + results
- `src/pages/parent/Profile.jsx` — parent profile + linked child

Nav items: Dashboard, Attendance, Fees, Examinations, Profile

---

## Phase 5 — Routing Update

**File: `src/App.jsx`** — add three new route subtrees:

```jsx
<Route path="/student"  element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
  <Route index element={<StudentDashboard />} />
  ...
</Route>

<Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
  ...
</Route>

<Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout />  </ProtectedRoute>}>
  ...
</Route>
```

Login page redirects to role-appropriate dashboard after sign-in:
```js
const destinations = { admin: '/admin', student: '/student', teacher: '/teacher', parent: '/parent' }
navigate(destinations[user.role] || '/')
```

---

## Phase 6 — Register Flow Update

**File: `src/pages/Register.jsx`** + **`src/components/register/`** — currently UI-only with no auth call.

Update to call `register(email, password, role, profileData)` from AuthContext, which:
1. Creates the Supabase auth user
2. Inserts the appropriate profile row
3. Redirects to the role's dashboard

---

## Login Page Update

Single Login page (`/login`) works for all roles — Supabase auth handles credential lookup regardless of role. After successful login, role is fetched from `profiles` and the user is redirected to the correct portal.

---

## Environment Setup

Two environment variables needed (added to `.env.local`):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Shared Components to Reuse

- `StatCard` — used in all portal dashboards (same component, different data)
- `SealMark` — brand logo in all sidebars
- Sidebar glider CSS pattern — same `translateY` glider approach for all three new sidebars
- `ConfirmDialog` — already built, reuse for any destructive actions
- `SparklesCore` — background on login page (already done)
- All `src/data/*.js` seed files — used as **fallback/demo data** when Supabase is not yet connected

---

## Verification

1. `pnpm dev` — app loads, landing page works
2. Login as admin → redirected to `/admin`, all pages functional
3. Login as student (seed account) → redirected to `/student`, sees only own data
4. Login as teacher → redirected to `/teacher`, can mark attendance for assigned classes
5. Login as parent → redirected to `/parent`, sees their child's records only
6. Attempting to navigate to `/admin` as a student → redirected to `/`
7. Supabase dashboard → verify rows are inserted/updated correctly on admin CRUD operations
