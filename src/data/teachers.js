export const DEPARTMENT_OPTIONS = [
  'Sciences', 'Mathematics', 'Languages', 'Social Studies', 'Arts & Physical Ed',
]

export const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Fine Arts',
]

export const SEED_TEACHERS = [
  { teacherId: 'TCH-001', name: 'Dr. Priya Ramachandran', department: 'Sciences', subjects: ['Physics', 'Chemistry'], contact: '+91 98765 11001', email: 'priya.r@ledgerhall.in', experience: '14 yrs', classes: 'Grade 9–12', status: 'Active' },
  { teacherId: 'TCH-002', name: 'Mr. Arjun Venkatesh',    department: 'Mathematics',  subjects: ['Mathematics'],          contact: '+91 98765 11002', email: 'arjun.v@ledgerhall.in', experience: '9 yrs',  classes: 'Grade 7–10', status: 'Active' },
  { teacherId: 'TCH-003', name: 'Ms. Sneha Pillai',       department: 'Languages',    subjects: ['English', 'Hindi'],     contact: '+91 98765 11003', email: 'sneha.p@ledgerhall.in', experience: '6 yrs',  classes: 'Grade 6–9', status: 'Active' },
  { teacherId: 'TCH-004', name: 'Mr. Karthik Bose',       department: 'Sciences',     subjects: ['Biology'],              contact: '+91 98765 11004', email: 'karthik.b@ledgerhall.in', experience: '11 yrs', classes: 'Grade 8–12', status: 'On Leave' },
  { teacherId: 'TCH-005', name: 'Ms. Anitha Suresh',      department: 'Social Studies', subjects: ['Social Studies'],    contact: '+91 98765 11005', email: 'anitha.s@ledgerhall.in', experience: '8 yrs',  classes: 'Grade 6–8', status: 'Active' },
  { teacherId: 'TCH-006', name: 'Mr. Rohit Desai',        department: 'Mathematics',  subjects: ['Mathematics', 'Computer Science'], contact: '+91 98765 11006', email: 'rohit.d@ledgerhall.in', experience: '5 yrs', classes: 'Grade 10–12', status: 'Active' },
  { teacherId: 'TCH-007', name: 'Ms. Deepa Nair',         department: 'Arts & Physical Ed', subjects: ['Fine Arts'],     contact: '+91 98765 11007', email: 'deepa.n@ledgerhall.in', experience: '7 yrs',  classes: 'Grade 6–10', status: 'Active' },
  { teacherId: 'TCH-008', name: 'Mr. Suresh Kumar',       department: 'Arts & Physical Ed', subjects: ['Physical Education'], contact: '+91 98765 11008', email: 'suresh.k@ledgerhall.in', experience: '12 yrs', classes: 'Grade 6–12', status: 'Active' },
  { teacherId: 'TCH-009', name: 'Dr. Meena Iyer',         department: 'Sciences',     subjects: ['Chemistry'],            contact: '+91 98765 11009', email: 'meena.i@ledgerhall.in', experience: '18 yrs', classes: 'Grade 10–12', status: 'Active' },
  { teacherId: 'TCH-010', name: 'Ms. Kavitha Rajan',      department: 'Languages',    subjects: ['Hindi', 'English'],     contact: '+91 98765 11010', email: 'kavitha.r@ledgerhall.in', experience: '4 yrs',  classes: 'Grade 6–8', status: 'On Leave' },
]

export const emptyTeacher = () => ({
  teacherId: '', name: '', department: '', subjects: [],
  contact: '', email: '', experience: '', classes: '', status: 'Active',
})
