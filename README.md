# Ledgerhall — School Management System (Frontend UI)

A frontend-only Login + Registration + Admin Panel UI for a School Management
System, built with React, Tailwind CSS, React Router, and Framer Motion. There is
still no real backend, API, or database — auth is a lightweight client-side
context, and admin data (students, etc.) is in-memory sample data structured to
be swapped for a real API later (e.g. Java + MySQL + JDBC).

## Design direction

Rather than a generic bright-blue SaaS look, this uses an "academic institution ledger"
identity:

- **Palette** — deep ink-navy (`ink`), royal blue (`royal`), and a muted gold accent
  (`gold`) used sparingly for emphasis, on white/near-white surfaces.
- **Type** — `Fraunces` (serif, display) for headings paired with `Plus Jakarta Sans`
  (sans) for body/UI text.
- **Signature element** — the "seal" mark (`SealMark.jsx`): a hexagonal emblem
  combining a mortarboard and open book, drawn in with a stroke animation on load,
  reused as the brand mark and echoed in the role-card "stamp" selection animation.
- **Admin panel** — carries the same navy/white/gold identity into a dashboard
  shell (sidebar + topbar) with card, table, and modal patterns for managing
  school records.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Routes:

- `/login` — Login page
- `/register` — Role selection → Student / Teacher / Parent registration form
- `/admin` — Admin dashboard (protected)
- `/admin/students` — Student Management (the only fully built admin module so far)
- `/admin/teachers`, `/admin/attendance`, `/admin/examinations`, `/admin/timetable`,
  `/admin/fees`, `/admin/reports`, `/admin/settings` — placeholder "Coming soon" screens

## Structure

```
src/
  components/
    SealMark.jsx            Signature seal emblem (animated)
    SchoolLogo.jsx           Ledgerhall wordmark/logo
    AuthIllustration.jsx    Desktop side panel for the login page
    ui/
      TextInput.jsx
      PasswordInput.jsx     Includes show/hide toggle
      SelectInput.jsx
      Button.jsx
      FileUpload.jsx        Profile picture upload with preview
    register/
      RoleCard.jsx           Student / Teacher / Parent selector card
      FormShell.jsx          Shared card/header wrapper for the 3 forms
      StudentForm.jsx
      TeacherForm.jsx
      ParentForm.jsx
    admin/
      AdminLayout.jsx         Sidebar + topbar shell for all /admin/* pages
      Sidebar.jsx
      Topbar.jsx
      ProtectedRoute.jsx      Route guard using AuthContext
      StatCard.jsx            Dashboard metric card
      ComingSoon.jsx           Placeholder for unbuilt admin modules
      StudentModal.jsx         Add / View / Edit modal for a student record
      ConfirmDialog.jsx        Reusable delete-confirmation dialog
  context/
    AuthContext.jsx           Lightweight client-side auth/session state
  data/
    students.js                Sample student records + form option lists,
                                shaped to match a future `students` SQL table
  lib/
    validators.js            Small dummy client-side validators
  pages/
    Login.jsx
    Register.jsx
    admin/
      Dashboard.jsx
      Students.jsx             Student Management: search, class filter,
                                paginated table, Add/View/Edit/Delete modals
      Teachers.jsx, Attendance.jsx, Examinations.jsx, Timetable.jsx,
      Fees.jsx, Reports.jsx, Settings.jsx   Coming-soon placeholders
  App.jsx                    Routes
  main.jsx                   Entry point (BrowserRouter)
  index.css                  Tailwind directives + base styles
```

## Notes

- All form submissions are simulated (`setTimeout`) and show inline dummy validation
  messages — nothing is sent anywhere.
- Fully responsive: single-column card on mobile/tablet, split illustration + form
  layout on desktop (`lg:` breakpoint) for auth pages; the admin panel is a
  responsive sidebar/table layout with a scrollable table on small screens.
- Respects `prefers-reduced-motion`.
- Student Management is fully interactive client-side (add, view, edit, delete,
  search, filter, paginate) but does not persist — refreshing resets to the
  sample data in `src/data/students.js`.
- Only the Students module is built out under `/admin`; the remaining sidebar
  items are intentional placeholders for future work.
