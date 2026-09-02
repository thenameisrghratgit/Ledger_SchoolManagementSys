export const EXAM_TYPES = ['Unit Test', 'Mid-term', 'Final', 'Pre-board', 'Practice']

export const SUBJECTS_ALL = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'Social Studies', 'Computer Science',
]

export const SEED_EXAMS = [
  { id: 'EX-001', name: 'Mid-term Examination',   type: 'Mid-term', subject: 'Mathematics',      className: 'Class 10', date: '2026-09-10', time: '09:00', duration: '3h', room: 'Hall A', maxMarks: 100, status: 'Upcoming' },
  { id: 'EX-002', name: 'Mid-term Examination',   type: 'Mid-term', subject: 'Physics',           className: 'Class 10', date: '2026-09-11', time: '09:00', duration: '3h', room: 'Hall A', maxMarks: 100, status: 'Upcoming' },
  { id: 'EX-003', name: 'Mid-term Examination',   type: 'Mid-term', subject: 'English',           className: 'Class 9',  date: '2026-09-12', time: '10:00', duration: '2h', room: 'Hall B', maxMarks: 80,  status: 'Upcoming' },
  { id: 'EX-004', name: 'Unit Test – I',           type: 'Unit Test', subject: 'Chemistry',       className: 'Class 11', date: '2026-09-05', time: '11:00', duration: '1h', room: 'Lab 1',  maxMarks: 30,  status: 'Upcoming' },
  { id: 'EX-005', name: 'Unit Test – I',           type: 'Unit Test', subject: 'Biology',         className: 'Class 12', date: '2026-09-06', time: '11:00', duration: '1h', room: 'Lab 2',  maxMarks: 30,  status: 'Upcoming' },
  { id: 'EX-006', name: 'Unit Test – Hindi',       type: 'Unit Test', subject: 'Hindi',           className: 'Class 8',  date: '2026-08-28', time: '09:30', duration: '1h', room: 'Room 3', maxMarks: 25,  status: 'Completed' },
  { id: 'EX-007', name: 'Practice Test',           type: 'Practice',  subject: 'Social Studies',  className: 'Class 7',  date: '2026-08-22', time: '10:00', duration: '1h', room: 'Room 5', maxMarks: 25,  status: 'Completed' },
  { id: 'EX-008', name: 'Computer Science Test',  type: 'Unit Test', subject: 'Computer Science', className: 'Class 11', date: '2026-08-18', time: '02:00', duration: '1.5h', room: 'Lab 3', maxMarks: 50, status: 'Completed' },
]
