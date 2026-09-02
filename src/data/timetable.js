export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const PERIODS = [
  { id: 1, label: 'Period 1', time: '8:00–8:45' },
  { id: 2, label: 'Period 2', time: '8:45–9:30' },
  { id: 3, label: 'Break',    time: '9:30–9:50',   isBreak: true },
  { id: 4, label: 'Period 3', time: '9:50–10:35' },
  { id: 5, label: 'Period 4', time: '10:35–11:20' },
  { id: 6, label: 'Lunch',    time: '11:20–12:00', isBreak: true },
  { id: 7, label: 'Period 5', time: '12:00–12:45' },
  { id: 8, label: 'Period 6', time: '12:45–1:30' },
  { id: 9, label: 'Period 7', time: '1:30–2:15' },
  { id: 10, label: 'Period 8', time: '2:15–3:00' },
]

// Seed timetable for Class 10 - A
const C10A = {
  Monday:    [{ s: 'Mathematics', t: 'Mr. Arjun V.' }, { s: 'Physics', t: 'Dr. Priya R.' }, null, { s: 'Chemistry', t: 'Dr. Meena I.' }, { s: 'English', t: 'Ms. Sneha P.' }, null, { s: 'Social Studies', t: 'Ms. Anitha S.' }, { s: 'Computer Sc.', t: 'Mr. Rohit D.' }],
  Tuesday:   [{ s: 'Physics', t: 'Dr. Priya R.' }, { s: 'Chemistry', t: 'Dr. Meena I.' }, null, { s: 'Mathematics', t: 'Mr. Arjun V.' }, { s: 'Hindi', t: 'Ms. Kavitha R.' }, null, { s: 'English', t: 'Ms. Sneha P.' }, { s: 'Biology', t: 'Mr. Karthik B.' }],
  Wednesday: [{ s: 'Chemistry', t: 'Dr. Meena I.' }, { s: 'Mathematics', t: 'Mr. Arjun V.' }, null, { s: 'English', t: 'Ms. Sneha P.' }, { s: 'Physics', t: 'Dr. Priya R.' }, null, { s: 'Fine Arts', t: 'Ms. Deepa N.' }, { s: 'Fine Arts', t: 'Ms. Deepa N.' }],
  Thursday:  [{ s: 'Hindi', t: 'Ms. Kavitha R.' }, { s: 'Social Studies', t: 'Ms. Anitha S.' }, null, { s: 'Biology', t: 'Mr. Karthik B.' }, { s: 'Mathematics', t: 'Mr. Arjun V.' }, null, { s: 'Physics', t: 'Dr. Priya R.' }, { s: 'Computer Sc.', t: 'Mr. Rohit D.' }],
  Friday:    [{ s: 'English', t: 'Ms. Sneha P.' }, { s: 'Biology', t: 'Mr. Karthik B.' }, null, { s: 'Hindi', t: 'Ms. Kavitha R.' }, { s: 'Chemistry', t: 'Dr. Meena I.' }, null, { s: 'Mathematics', t: 'Mr. Arjun V.' }, { s: 'Phys. Ed.', t: 'Mr. Suresh K.' }],
  Saturday:  [{ s: 'Phys. Ed.', t: 'Mr. Suresh K.' }, { s: 'Computer Sc.', t: 'Mr. Rohit D.' }, null, { s: 'Social Studies', t: 'Ms. Anitha S.' }, { s: 'Mathematics', t: 'Mr. Arjun V.' }, null, null, null],
}

// Seed timetable for Class 9 - A
const C9A = {
  Monday:    [{ s: 'English', t: 'Ms. Sneha P.' }, { s: 'Mathematics', t: 'Mr. Arjun V.' }, null, { s: 'Social Studies', t: 'Ms. Anitha S.' }, { s: 'Hindi', t: 'Ms. Kavitha R.' }, null, { s: 'Physics', t: 'Dr. Priya R.' }, { s: 'Chemistry', t: 'Dr. Meena I.' }],
  Tuesday:   [{ s: 'Mathematics', t: 'Mr. Arjun V.' }, { s: 'English', t: 'Ms. Sneha P.' }, null, { s: 'Physics', t: 'Dr. Priya R.' }, { s: 'Biology', t: 'Mr. Karthik B.' }, null, { s: 'Hindi', t: 'Ms. Kavitha R.' }, { s: 'Phys. Ed.', t: 'Mr. Suresh K.' }],
  Wednesday: [{ s: 'Social Studies', t: 'Ms. Anitha S.' }, { s: 'Chemistry', t: 'Dr. Meena I.' }, null, { s: 'Mathematics', t: 'Mr. Arjun V.' }, { s: 'English', t: 'Ms. Sneha P.' }, null, { s: 'Computer Sc.', t: 'Mr. Rohit D.' }, { s: 'Computer Sc.', t: 'Mr. Rohit D.' }],
  Thursday:  [{ s: 'Biology', t: 'Mr. Karthik B.' }, { s: 'Hindi', t: 'Ms. Kavitha R.' }, null, { s: 'Chemistry', t: 'Dr. Meena I.' }, { s: 'Social Studies', t: 'Ms. Anitha S.' }, null, { s: 'Mathematics', t: 'Mr. Arjun V.' }, { s: 'Fine Arts', t: 'Ms. Deepa N.' }],
  Friday:    [{ s: 'Chemistry', t: 'Dr. Meena I.' }, { s: 'Physics', t: 'Dr. Priya R.' }, null, { s: 'English', t: 'Ms. Sneha P.' }, { s: 'Mathematics', t: 'Mr. Arjun V.' }, null, { s: 'Biology', t: 'Mr. Karthik B.' }, { s: 'Social Studies', t: 'Ms. Anitha S.' }],
  Saturday:  [{ s: 'Fine Arts', t: 'Ms. Deepa N.' }, { s: 'Phys. Ed.', t: 'Mr. Suresh K.' }, null, { s: 'Hindi', t: 'Ms. Kavitha R.' }, null, null, null, null],
}

export const SEED_TIMETABLES = {
  'Class 10': C10A,
  'Class 9': C9A,
}

export const TIMETABLE_CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12']

export const ALL_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'Social Studies', 'Computer Sc.',
  'Fine Arts', 'Phys. Ed.',
]
