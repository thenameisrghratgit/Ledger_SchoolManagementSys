# LedgerHall — School Management System

A full-stack school management system built with **React 19 + Vite + Tailwind CSS** for the frontend and **Supabase** for authentication, PostgreSQL database services, APIs, and Row Level Security (RLS).

LedgerHall does **not use a custom Node.js, Python, or FastAPI backend server**. The browser communicates directly with Supabase through the API modules in `src/api/`, while PostgreSQL and RLS enforce data access and permissions.

---

## ✨ Features

- 🔐 Real Supabase authentication
- 👥 Role-based access control
- 🛡️ PostgreSQL Row Level Security (RLS)
- 👨‍💼 Admin management portal
- 👨‍🏫 Teacher portal
- 🎓 Student portal
- 👨‍👩‍👧 Parent portal
- 📊 Attendance management
- 📝 Examinations and results
- 💰 Fee management
- 📅 Timetable management
- 📈 Reports
- ⚙️ School settings
- 🔄 Real database persistence through Supabase
- 📱 Responsive UI
- ♿ Reduced-motion support
- 🧪 Automated tests with Vitest

---

# 👥 Roles & Portals

| Role | Login Access | Portal | Main Features |
|---|---|---|---|
| **Admin** | Seeded account | `/admin` | Students, teachers, attendance, exams, timetable, fees, reports, settings |
| **Teacher** | Registered or seeded | `/teacher` | Classes, attendance, exam results, timetable, profile, self-attendance |
| **Student** | Registered or seeded | `/student` | Dashboard, timetable, attendance, exams/results, fees, profile |
| **Parent** | Registered or seeded | `/parent` | Child dashboard, attendance, fees, exams, profile |

---

# 🔑 Demo Accounts

The demo accounts are created by:

```text
supabase/seed_demo_users.sql
```

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ledgerhall.in` | `admin1234` |
| Student | `student@ledgerhall.in` | `student123` |
| Teacher | `teacher@ledgerhall.in` | `teacher123` |
| Parent | `parent@ledgerhall.in` | `parent123` |

> ⚠️ These credentials are intended for development/demo purposes and should not be used in production.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd school-management-github
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure Supabase

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

You can use the provided template:

```bash
cp .env.example .env
```

Then replace the placeholder values with your Supabase project credentials.

### Important

Never commit `.env` or any service-role/secret key to GitHub.

Only the Supabase publishable/anon key is used by the frontend.

---

# 🗄️ Database Setup

Create a Supabase project and open:

**Supabase Dashboard → SQL Editor**

Run the SQL files in this exact order:

### 1. Database schema

```text
supabase/schema.sql
```

Creates:

- Tables
- Indexes
- Foreign keys
- Database triggers
- Helper functions

### 2. Row Level Security

```text
supabase/policies.sql
```

Creates RLS policies for the application tables.

### 3. Demo school data

```text
supabase/seed.sql
```

Creates the initial school data including:

- Students
- Teachers
- Attendance
- Examinations
- Results
- Fees
- Timetable
- Settings

### 4. Demo authentication users

```text
supabase/seed_demo_users.sql
```

Creates the four demo authentication accounts listed above.

For additional database setup information, registration rules, and RLS verification queries, see:

```text
supabase/README.md
```

---

# 🏗️ Architecture

LedgerHall uses **Supabase as its Backend-as-a-Service (BaaS) platform**.

```text
┌───────────────────────────┐
│       React Frontend      │
│                           │
│  Admin / Teacher /        │
│  Student / Parent         │
└─────────────┬─────────────┘
              │
              │ Supabase JS SDK
              ▼
┌───────────────────────────┐
│          Supabase         │
│                           │
│  Authentication           │
│  Data API                 │
│  Row Level Security       │
│  PostgreSQL               │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│      PostgreSQL DB        │
│                           │
│ Students                  │
│ Teachers                  │
│ Attendance                │
│ Exams / Results           │
│ Fees                      │
│ Timetable                 │
│ Profiles / Settings       │
└───────────────────────────┘
```

There is no separately developed traditional backend server such as:

- Node.js / Express
- Django
- FastAPI
- Spring Boot

Supabase provides the managed backend services while PostgreSQL acts as the underlying relational database.

---

# 🔐 Authentication

LedgerHall uses real Supabase Authentication.

Supported authentication functionality includes:

- Email/password sign-in
- Registration
- Password reset
- Google OAuth
- Azure OAuth

Authentication is handled through:

```text
src/context/AuthContext.jsx
```

The application determines the user's portal using:

```text
portalFor()
```

After authentication, the user is routed to the appropriate portal based on their role.

---

## Registration Security

A database trigger named:

```text
handle_new_user
```

creates the corresponding profile and role-specific record during registration.

Student and teacher registration requires an existing, unlinked Student ID or Teacher ID.

This prevents users from simply registering with an arbitrary ID belonging to another student or teacher.

Parent registration links the parent account to the corresponding student.

Admin accounts are not created through the normal client registration flow.

---

# 🛡️ Security Model

LedgerHall uses PostgreSQL Row Level Security (**RLS**) to control access to application data.

### Admin

Admins have full management access to the school data.

### Students

Students can access and update only their permitted profile information and view their own academic information.

### Parents

Parents can access information belonging to their linked child, including:

- Attendance
- Examinations
- Results
- Fees

### Teachers

Teachers can access students belonging to their classes and perform permitted operations such as:

- Attendance
- Examination results
- Class-related information

### Shared Information

Authenticated users can access permitted:

- Timetables
- Examination information
- School settings

---

## 🔒 Database-Level Protection

Security is not implemented only in the React frontend.

Database triggers and RLS policies help prevent privilege escalation.

Examples include:

- Non-admin users cannot change their own role.
- Non-admin users cannot arbitrarily change account status.
- Students cannot modify protected class/section identifiers.
- Users cannot access another student's restricted records.
- Parent access is limited to the linked child.
- Fee modifications are restricted according to role and permitted actions.
- Service-role credentials are never exposed to the frontend.

This means that even if someone bypasses the React UI and directly attempts a database request, PostgreSQL RLS still evaluates whether the operation is permitted.

---

# 📁 Project Structure

```text
LedgerHall/
│
├── supabase/
│   ├── schema.sql
│   ├── policies.sql
│   ├── seed.sql
│   ├── seed_demo_users.sql
│   └── README.md
│
├── src/
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── api/
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── attendance.js
│   │   ├── examinations.js
│   │   ├── fees.js
│   │   ├── timetable.js
│   │   ├── profiles.js
│   │   └── settings.js
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── register/
│   │   └── ui/
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Teachers.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Examinations.jsx
│   │   │   ├── Timetable.jsx
│   │   │   ├── Fees.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── student/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Timetable.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Examinations.jsx
│   │   │   ├── Fees.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── teacher/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyClasses.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Examinations.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   └── parent/
│   │       ├── Dashboard.jsx
│   │       ├── Attendance.jsx
│   │       ├── Fees.jsx
│   │       ├── Examinations.jsx
│   │       └── Profile.jsx
│   │
│   └── data/
│       └── option-list constants
│
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

The `src/api/` modules act as the application's data-access layer.

They communicate with Supabase and map between frontend naming conventions and PostgreSQL column naming conventions.

---

# 🔄 Data Flow

A typical operation follows this flow:

```text
User
  ↓
React Page
  ↓
API Module
  ↓
Supabase JS Client
  ↓
Supabase Data API
  ↓
PostgreSQL
  ↓
RLS Policy Check
  ↓
Database Operation
  ↓
Response
  ↓
React UI
```

For example, when an administrator adds a student:

```text
Admin
 ↓
Students Page
 ↓
students.js
 ↓
Supabase
 ↓
PostgreSQL
 ↓
RLS verifies Admin permission
 ↓
Student stored in database
 ↓
Updated student list displayed
```

The data persists in the Supabase PostgreSQL database and is not dependent on frontend-only state.

---

# 🧪 Testing

LedgerHall uses **Vitest** for automated testing.

Run the complete test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The tests cover areas such as:

- API behavior
- API mapping
- Unconfigured Supabase behavior
- Portal/role routing

---

# 📦 Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm test
```

Runs the Vitest test suite.

```bash
npm run test:watch
```

Runs Vitest in watch mode.

```bash
npm run format
```

Formats the project using Oxfmt.

---

# 🎨 Design Direction

LedgerHall follows an **academic institution / ledger-inspired visual identity** rather than a generic SaaS dashboard.

### Visual language

- Deep ink navy
- Royal blue
- Muted gold
- Fraunces serif headings
- Plus Jakarta Sans body text
- Animated hexagonal `SealMark` emblem

The interface is responsive across desktop and mobile layouts.

Authentication pages use a split illustration/form layout on larger screens and a single-column layout on smaller screens.

Animations respect:

```text
prefers-reduced-motion
```

---

# 📱 Responsive Design

The application supports:

- Desktop
- Laptop
- Tablet
- Mobile

Major dashboards and portal pages adapt their layouts for smaller screens.

---

# ⚠️ Known Limitations

### Supabase dependency

The application requires a configured Supabase project for real authentication and database operations.

When Supabase environment variables are missing, the application displays an explicit configuration state instead of silently using fake data.

### Parent registration

Parent registration links the account using the Student ID.

If a parent registers before the student exists or before the student can be linked, the application displays an explicit **no linked student** state.

### GitHub Pages

If deployed through GitHub Pages, the application uses the configured:

```text
/Ledger_SchoolManagementSys/
```

base path.

Authentication redirect URLs are derived from the current location and configured base path.

---

# 🔧 Development Notes

### Environment variables

Do not commit:

```text
.env
```

Use:

```text
.env.example
```

as the template for required environment variables.

### Supabase keys

The frontend uses the Supabase publishable/anon key.

Never expose a Supabase service-role key in:

- React source code
- `.env` committed to Git
- Client-side JavaScript
- Public repositories

Service-role operations should remain server-side or within trusted Supabase environments.

---

# 🚀 Production Checklist

Before deploying LedgerHall:

- [ ] Configure production Supabase project
- [ ] Run `schema.sql`
- [ ] Run `policies.sql`
- [ ] Run appropriate production seed/setup scripts
- [ ] Configure authentication providers
- [ ] Configure production redirect URLs
- [ ] Add production environment variables
- [ ] Verify RLS policies
- [ ] Verify each role's permissions
- [ ] Test login for Admin, Teacher, Student and Parent
- [ ] Test CRUD persistence
- [ ] Run `npm test`
- [ ] Run `npm run build`
- [ ] Verify `.env` is not committed
- [ ] Deploy the production build

---

# 📄 License

This project is intended for academic, demonstration, and educational purposes.

---

## 💡 Project Summary

**LedgerHall** is a role-based school management system that combines a modern React frontend with Supabase's managed backend services and PostgreSQL database.

The project demonstrates:

- React application architecture
- Role-based authentication
- PostgreSQL database design
- Supabase integration
- Row Level Security
- CRUD operations
- Academic management workflows
- Responsive UI design
- Automated testing

The core architectural principle is:

> **React handles the user experience, Supabase provides the backend services, PostgreSQL stores the data, and RLS enforces access control.**
