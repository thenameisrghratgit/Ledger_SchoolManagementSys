// Maps raw Supabase/PostgreSQL/auth errors to messages users can understand.
// Unknown/technical messages fall back to a safe generic sentence.

const RULES = [
  [
    /duplicate key value violates unique constraint "students_student_id_key"/i,
    'This student ID is already assigned to another student.',
  ],
  [
    /duplicate key value violates unique constraint "teachers_teacher_id_key"/i,
    'This teacher ID is already assigned to another teacher.',
  ],
  [
    /duplicate key value violates unique constraint "attendance_student_id_date_key"/i,
    'Attendance for this student on this date already exists.',
  ],
  [
    /duplicate key value violates unique constraint "exam_results_exam_id_student_id_key"/i,
    'A result for this exam and student already exists.',
  ],
  [
    /duplicate key value violates unique constraint/i,
    'That record already exists. Please use a different value.',
  ],
  [/Student ID .* already registered to another account/i, 'This Student ID is already registered to another account.'],
  [/Teacher ID .* already registered to another account/i, 'This Teacher ID is already registered to another account.'],
  [/Student ID is required/i, 'Enter the Student ID issued by your school to register.'],
  [/Teacher ID is required/i, 'Enter the Teacher ID issued by your school to register.'],
  [/Only administrators can change/i, 'Only an administrator can change this field.'],
  [/Profile role\/status can only be changed/i, 'Only an administrator can change the role or status.'],
  [/Not allowed to update this profile/i, 'You can only update your own profile.'],
  [/Payment date cannot be cleared/i, 'The payment date cannot be cleared.'],
  [/Only administrators can change fee status/i, 'Only an administrator can change the fee status.'],
  [
    /row-level security|new row violates.*policy/i,
    'You do not have permission to do this.',
  ],
  [/Invalid login credentials/i, 'Incorrect email or password.'],
  [/Email not confirmed/i, 'Please confirm your email address before signing in.'],
  [/already registered/i, 'An account with this email address is already registered.'],
  [/Password should be at least/i, 'Password must be at least 6 characters long.'],
  [/is invalid/i, 'The email address or password is invalid.'],
  [/rate limit|too many requests/i, 'Too many attempts. Please wait a moment and try again.'],
  [/Failed to fetch|NetworkError|network/i, 'Cannot reach the server. Check your internet connection and Supabase configuration.'],
  [/not configured/i, 'Supabase is not configured. Copy .env.example to .env and set your Supabase URL and key, then restart the dev server.'],
  [/JWT|refresh_token|session/i, 'Your session has expired. Please sign in again.'],
]

export function friendlyError(error) {
  if (!error) return null
  const raw = typeof error === 'string' ? error : error.message || String(error)
  for (const [pattern, message] of RULES) {
    if (pattern.test(raw)) return message
  }
  if (raw.length <= 120 && !/[{}]|row|column|constraint|relation|sqlstate|pg_/i.test(raw)) {
    return raw
  }
  return 'Something went wrong. Please try again.'
}
