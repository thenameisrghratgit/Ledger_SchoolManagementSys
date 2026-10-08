-- ============================================================================
-- Ledgerhall School Management — demo seed data
-- Translated 1:1 from src/data/*.js (no random/generated values).
-- Run AFTER schema.sql, BEFORE policies.sql (order is forgiving: the
-- postgres role bypasses RLS). Re-runnable (on conflict do nothing).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Students
-- ----------------------------------------------------------------------------
insert into public.students (student_id, name, dob, gender, class_name, section, parent_name, contact, address) values
  ('STU-2026-0142', 'Aarav Krishnan',  '2011-04-12', 'Male',   'Class 8',  'B', 'Suresh Krishnan', '+91 98765 43210', '14, Lake View Road, Chennai'),
  ('STU-2026-0143', 'Diya Sharma',     '2010-09-03', 'Female', 'Class 9',  'A', 'Rohan Sharma',    '+91 98765 00000', '221, MG Road, Bengaluru'),
  ('STU-2026-0144', 'Vivaan Iyer',     '2012-01-27', 'Male',   'Class 7',  'C', 'Kavitha Iyer',    '+91 90000 11122', '9, Anna Nagar, Chennai'),
  ('STU-2026-0145', 'Ananya Reddy',    '2009-11-15', 'Female', 'Class 10', 'A', 'Prasad Reddy',    '+91 99887 76655', '45, Jubilee Hills, Hyderabad'),
  ('STU-2026-0146', 'Kabir Mehta',     '2011-06-30', 'Male',   'Class 8',  'A', 'Neha Mehta',      '+91 98123 45670', '3, Marine Drive, Mumbai'),
  ('STU-2026-0147', 'Ishaan Nair',     '2010-03-08', 'Male',   'Class 9',  'B', 'Ramesh Nair',     '+91 97654 32109', '78, MG Road, Kochi'),
  ('STU-2026-0148', 'Myra Kapoor',     '2012-08-19', 'Female', 'Class 7',  'A', 'Anil Kapoor',     '+91 96543 21098', '12, Sector 21, Gurugram'),
  ('STU-2026-0149', 'Reyansh Gupta',   '2009-05-22', 'Male',   'Class 10', 'B', 'Manoj Gupta',     '+91 95432 10987', '56, Civil Lines, Delhi'),
  ('STU-2026-0150', 'Saanvi Joshi',    '2011-12-01', 'Female', 'Class 8',  'C', 'Vikram Joshi',    '+91 94321 09876', '90, FC Road, Pune'),
  ('STU-2026-0151', 'Arjun Menon',     '2010-07-14', 'Male',   'Class 9',  'C', 'Sunita Menon',    '+91 93210 98765', '5, Panampilly Nagar, Kochi'),
  ('STU-2026-0152', 'Aditi Verma',     '2012-02-25', 'Female', 'Class 6',  'A', 'Deepak Verma',    '+91 92109 87654', '32, Vasant Kunj, Delhi'),
  ('STU-2026-0153', 'Vihaan Rao',      '2009-10-09', 'Male',   'Class 11', 'A', 'Lakshmi Rao',     '+91 91098 76543', '18, Indiranagar, Bengaluru')
on conflict (student_id) do nothing;

-- ----------------------------------------------------------------------------
-- Teachers
-- ----------------------------------------------------------------------------
insert into public.teachers (teacher_id, name, department, subjects, contact, email, experience, classes, status) values
  ('TCH-001', 'Dr. Priya Ramachandran', 'Sciences',            '{Physics,Chemistry}',                        '+91 98765 11001', 'priya.r@ledgerhall.in',  '14 yrs', 'Grade 9–12',  'Active'),
  ('TCH-002', 'Mr. Arjun Venkatesh',    'Mathematics',         '{Mathematics}',                              '+91 98765 11002', 'arjun.v@ledgerhall.in',  '9 yrs',  'Grade 7–10',  'Active'),
  ('TCH-003', 'Ms. Sneha Pillai',       'Languages',           '{English,Hindi}',                            '+91 98765 11003', 'sneha.p@ledgerhall.in',  '6 yrs',  'Grade 6–9',   'Active'),
  ('TCH-004', 'Mr. Karthik Bose',       'Sciences',            '{Biology}',                                  '+91 98765 11004', 'karthik.b@ledgerhall.in','11 yrs', 'Grade 8–12',  'On Leave'),
  ('TCH-005', 'Ms. Anitha Suresh',      'Social Studies',      '{Social Studies}',                           '+91 98765 11005', 'anitha.s@ledgerhall.in', '8 yrs',  'Grade 6–8',   'Active'),
  ('TCH-006', 'Mr. Rohit Desai',        'Mathematics',         '{Mathematics,Computer Science}',             '+91 98765 11006', 'rohit.d@ledgerhall.in',  '5 yrs',  'Grade 10–12', 'Active'),
  ('TCH-007', 'Ms. Deepa Nair',         'Arts & Physical Ed',  '{Fine Arts}',                                '+91 98765 11007', 'deepa.n@ledgerhall.in',  '7 yrs',  'Grade 6–10',  'Active'),
  ('TCH-008', 'Mr. Suresh Kumar',       'Arts & Physical Ed',  '{Physical Education}',                       '+91 98765 11008', 'suresh.k@ledgerhall.in','12 yrs', 'Grade 6–12',  'Active'),
  ('TCH-009', 'Dr. Meena Iyer',         'Sciences',            '{Chemistry}',                                '+91 98765 11009', 'meena.i@ledgerhall.in',  '18 yrs', 'Grade 10–12', 'Active'),
  ('TCH-010', 'Ms. Kavitha Rajan',      'Languages',           '{Hindi,English}',                            '+91 98765 11010', 'kavitha.r@ledgerhall.in','4 yrs',  'Grade 6–8',   'On Leave')
on conflict (teacher_id) do nothing;

-- ----------------------------------------------------------------------------
-- Examinations
-- ----------------------------------------------------------------------------
insert into public.examinations (id, name, type, subject, class_name, date, time, duration, room, max_marks, status) values
  ('EX-001', 'Mid-term Examination',   'Mid-term',  'Mathematics',      'Class 10', '2026-09-10', '09:00', '3h',   'Hall A', 100, 'Upcoming'),
  ('EX-002', 'Mid-term Examination',   'Mid-term',  'Physics',          'Class 10', '2026-09-11', '09:00', '3h',   'Hall A', 100, 'Upcoming'),
  ('EX-003', 'Mid-term Examination',   'Mid-term',  'English',          'Class 9',  '2026-09-12', '10:00', '2h',   'Hall B', 80,  'Upcoming'),
  ('EX-004', 'Unit Test – I',          'Unit Test', 'Chemistry',        'Class 11', '2026-09-05', '11:00', '1h',   'Lab 1',  30,  'Upcoming'),
  ('EX-005', 'Unit Test – I',          'Unit Test', 'Biology',          'Class 12', '2026-09-06', '11:00', '1h',   'Lab 2',  30,  'Upcoming'),
  ('EX-006', 'Unit Test – Hindi',      'Unit Test', 'Hindi',            'Class 8',  '2026-08-28', '09:30', '1h',   'Room 3', 25,  'Completed'),
  ('EX-007', 'Practice Test',          'Practice',  'Social Studies',   'Class 7',  '2026-08-22', '10:00', '1h',   'Room 5', 25,  'Completed'),
  ('EX-008', 'Computer Science Test',  'Unit Test', 'Computer Science', 'Class 11', '2026-08-18', '02:00', '1.5h', 'Lab 3',  50,  'Completed')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Fees
-- ----------------------------------------------------------------------------
insert into public.fees (id, student_id, type, amount, due_date, paid_date, status) values
  ('FEE-0001', 'STU-2026-0142', 'Tuition',   18500, '2026-08-15', '2026-08-12', 'Paid'),
  ('FEE-0002', 'STU-2026-0143', 'Tuition',   20000, '2026-08-15', '2026-08-14', 'Paid'),
  ('FEE-0003', 'STU-2026-0144', 'Tuition',   16500, '2026-09-15', null,         'Pending'),
  ('FEE-0004', 'STU-2026-0145', 'Tuition',   22000, '2026-07-31', null,         'Overdue'),
  ('FEE-0005', 'STU-2026-0146', 'Transport', 4500,  '2026-09-01', '2026-09-01', 'Paid'),
  ('FEE-0006', 'STU-2026-0147', 'Transport', 4500,  '2026-09-01', null,         'Pending'),
  ('FEE-0007', 'STU-2026-0148', 'Library',   1200,  '2026-08-20', '2026-08-18', 'Paid'),
  ('FEE-0008', 'STU-2026-0149', 'Tuition',   22000, '2026-08-15', null,         'Overdue'),
  ('FEE-0009', 'STU-2026-0150', 'Sports',    2500,  '2026-09-10', null,         'Pending'),
  ('FEE-0010', 'STU-2026-0151', 'Tuition',   20000, '2026-09-15', null,         'Pending'),
  ('FEE-0011', 'STU-2026-0152', 'Exam',      800,   '2026-09-05', '2026-09-04', 'Paid'),
  ('FEE-0012', 'STU-2026-0153', 'Tuition',   24000, '2026-08-31', null,         'Overdue'),
  ('FEE-0013', 'STU-2026-0142', 'Sports',    2500,  '2026-09-10', null,         'Pending'),
  ('FEE-0014', 'STU-2026-0145', 'Transport', 4500,  '2026-07-31', null,         'Overdue')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Timetable (period_index 1..8, nulls in the JS seed = free periods)
-- ----------------------------------------------------------------------------
insert into public.timetable (class_name, day, period_index, subject, teacher_name) values
  ('Class 10', 'Monday',    1, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 10', 'Monday',    2, 'Physics',        'Dr. Priya R.'),
  ('Class 10', 'Monday',    4, 'Chemistry',      'Dr. Meena I.'),
  ('Class 10', 'Monday',    5, 'English',        'Ms. Sneha P.'),
  ('Class 10', 'Monday',    7, 'Social Studies', 'Ms. Anitha S.'),
  ('Class 10', 'Monday',    8, 'Computer Sc.',   'Mr. Rohit D.'),
  ('Class 10', 'Tuesday',   1, 'Physics',        'Dr. Priya R.'),
  ('Class 10', 'Tuesday',   2, 'Chemistry',      'Dr. Meena I.'),
  ('Class 10', 'Tuesday',   4, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 10', 'Tuesday',   5, 'Hindi',          'Ms. Kavitha R.'),
  ('Class 10', 'Tuesday',   7, 'English',        'Ms. Sneha P.'),
  ('Class 10', 'Tuesday',   8, 'Biology',        'Mr. Karthik B.'),
  ('Class 10', 'Wednesday', 1, 'Chemistry',      'Dr. Meena I.'),
  ('Class 10', 'Wednesday', 2, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 10', 'Wednesday', 4, 'English',        'Ms. Sneha P.'),
  ('Class 10', 'Wednesday', 5, 'Physics',        'Dr. Priya R.'),
  ('Class 10', 'Wednesday', 7, 'Fine Arts',      'Ms. Deepa N.'),
  ('Class 10', 'Wednesday', 8, 'Fine Arts',      'Ms. Deepa N.'),
  ('Class 10', 'Thursday',  1, 'Hindi',          'Ms. Kavitha R.'),
  ('Class 10', 'Thursday',  2, 'Social Studies', 'Ms. Anitha S.'),
  ('Class 10', 'Thursday',  4, 'Biology',        'Mr. Karthik B.'),
  ('Class 10', 'Thursday',  5, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 10', 'Thursday',  7, 'Physics',        'Dr. Priya R.'),
  ('Class 10', 'Thursday',  8, 'Computer Sc.',   'Mr. Rohit D.'),
  ('Class 10', 'Friday',    1, 'English',        'Ms. Sneha P.'),
  ('Class 10', 'Friday',    2, 'Biology',        'Mr. Karthik B.'),
  ('Class 10', 'Friday',    4, 'Hindi',          'Ms. Kavitha R.'),
  ('Class 10', 'Friday',    5, 'Chemistry',      'Dr. Meena I.'),
  ('Class 10', 'Friday',    7, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 10', 'Friday',    8, 'Phys. Ed.',      'Mr. Suresh K.'),
  ('Class 10', 'Saturday',  1, 'Phys. Ed.',      'Mr. Suresh K.'),
  ('Class 10', 'Saturday',  2, 'Computer Sc.',   'Mr. Rohit D.'),
  ('Class 10', 'Saturday',  4, 'Social Studies', 'Ms. Anitha S.'),
  ('Class 10', 'Saturday',  5, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 9',  'Monday',    1, 'English',        'Ms. Sneha P.'),
  ('Class 9',  'Monday',    2, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 9',  'Monday',    4, 'Social Studies', 'Ms. Anitha S.'),
  ('Class 9',  'Monday',    5, 'Hindi',          'Ms. Kavitha R.'),
  ('Class 9',  'Monday',    7, 'Physics',        'Dr. Priya R.'),
  ('Class 9',  'Monday',    8, 'Chemistry',      'Dr. Meena I.'),
  ('Class 9',  'Tuesday',   1, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 9',  'Tuesday',   2, 'English',        'Ms. Sneha P.'),
  ('Class 9',  'Tuesday',   4, 'Physics',        'Dr. Priya R.'),
  ('Class 9',  'Tuesday',   5, 'Biology',        'Mr. Karthik B.'),
  ('Class 9',  'Tuesday',   7, 'Hindi',          'Ms. Kavitha R.'),
  ('Class 9',  'Tuesday',   8, 'Phys. Ed.',      'Mr. Suresh K.'),
  ('Class 9',  'Wednesday', 1, 'Social Studies', 'Ms. Anitha S.'),
  ('Class 9',  'Wednesday', 2, 'Chemistry',      'Dr. Meena I.'),
  ('Class 9',  'Wednesday', 4, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 9',  'Wednesday', 5, 'English',        'Ms. Sneha P.'),
  ('Class 9',  'Wednesday', 7, 'Computer Sc.',   'Mr. Rohit D.'),
  ('Class 9',  'Wednesday', 8, 'Computer Sc.',   'Mr. Rohit D.'),
  ('Class 9',  'Thursday',  1, 'Biology',        'Mr. Karthik B.'),
  ('Class 9',  'Thursday',  2, 'Hindi',          'Ms. Kavitha R.'),
  ('Class 9',  'Thursday',  4, 'Chemistry',      'Dr. Meena I.'),
  ('Class 9',  'Thursday',  5, 'Social Studies', 'Ms. Anitha S.'),
  ('Class 9',  'Thursday',  7, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 9',  'Thursday',  8, 'Fine Arts',      'Ms. Deepa N.'),
  ('Class 9',  'Friday',    1, 'Chemistry',      'Dr. Meena I.'),
  ('Class 9',  'Friday',    2, 'Physics',        'Dr. Priya R.'),
  ('Class 9',  'Friday',    4, 'English',        'Ms. Sneha P.'),
  ('Class 9',  'Friday',    5, 'Mathematics',    'Mr. Arjun V.'),
  ('Class 9',  'Friday',    7, 'Biology',        'Mr. Karthik B.'),
  ('Class 9',  'Friday',    8, 'Social Studies', 'Ms. Anitha S.'),
  ('Class 9',  'Saturday',  1, 'Fine Arts',      'Ms. Deepa N.'),
  ('Class 9',  'Saturday',  2, 'Phys. Ed.',      'Mr. Suresh K.'),
  ('Class 9',  'Saturday',  4, 'Hindi',          'Ms. Kavitha R.')
on conflict (class_name, day, period_index) do nothing;

-- ----------------------------------------------------------------------------
-- School settings
-- ----------------------------------------------------------------------------
insert into public.school_settings (id, school_name, address, phone, email, academic_year, currency)
values (1, 'Ledgerhall Public School', null, null, null, '2026-27', 'INR')
on conflict (id) do update set
  school_name = excluded.school_name,
  academic_year = excluded.academic_year,
  currency = excluded.currency;
