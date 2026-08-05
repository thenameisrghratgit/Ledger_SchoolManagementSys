# Ledgerhall — School Management System (Frontend UI)

A frontend-only Login + Registration UI for a School Management System, built with
React, Tailwind CSS, React Router, and Framer Motion. No backend, API, database, or
auth logic — all validation is dummy/client-side, and form submits just simulate a
delay and show a success state.

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

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Routes:

- `/login` — Login page
- `/register` — Role selection → Student / Teacher / Parent registration form

## Structure

```
src/
  components/
    SealMark.jsx            Signature seal emblem (animated)
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
  lib/
    validators.js            Small dummy client-side validators
  pages/
    Login.jsx
    Register.jsx
  App.jsx                    Routes
  main.jsx                   Entry point (BrowserRouter)
  index.css                  Tailwind directives + base styles
```

## Notes

- All form submissions are simulated (`setTimeout`) and show inline dummy validation
  messages — nothing is sent anywhere.
- Fully responsive: single-column card on mobile/tablet, split illustration + form
  layout on desktop (`lg:` breakpoint).
- Respects `prefers-reduced-motion`.
