// Sample student data.
// Shape mirrors a future `students` MySQL table so it drops into a
// Java + JDBC backend with minimal changes:
//   students(student_id PK, name, dob, gender, class_name, section,
//             parent_name, contact_number, address)

export const CLASS_OPTIONS = [
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
]

export const GENDER_OPTIONS = ['Male', 'Female', 'Other']

export const SEED_STUDENTS = [
  { studentId: 'STU-2026-0142', name: 'Aarav Krishnan', dob: '2011-04-12', gender: 'Male', className: 'Class 8', section: 'B', parentName: 'Suresh Krishnan', contact: '+91 98765 43210', address: '14, Lake View Road, Chennai' },
  { studentId: 'STU-2026-0143', name: 'Diya Sharma', dob: '2010-09-03', gender: 'Female', className: 'Class 9', section: 'A', parentName: 'Rohan Sharma', contact: '+91 98765 00000', address: '221, MG Road, Bengaluru' },
  { studentId: 'STU-2026-0144', name: 'Vivaan Iyer', dob: '2012-01-27', gender: 'Male', className: 'Class 7', section: 'C', parentName: 'Kavitha Iyer', contact: '+91 90000 11122', address: '9, Anna Nagar, Chennai' },
  { studentId: 'STU-2026-0145', name: 'Ananya Reddy', dob: '2009-11-15', gender: 'Female', className: 'Class 10', section: 'A', parentName: 'Prasad Reddy', contact: '+91 99887 76655', address: '45, Jubilee Hills, Hyderabad' },
  { studentId: 'STU-2026-0146', name: 'Kabir Mehta', dob: '2011-06-30', gender: 'Male', className: 'Class 8', section: 'A', parentName: 'Neha Mehta', contact: '+91 98123 45670', address: '3, Marine Drive, Mumbai' },
  { studentId: 'STU-2026-0147', name: 'Ishaan Nair', dob: '2010-03-08', gender: 'Male', className: 'Class 9', section: 'B', parentName: 'Ramesh Nair', contact: '+91 97654 32109', address: '78, MG Road, Kochi' },
  { studentId: 'STU-2026-0148', name: 'Myra Kapoor', dob: '2012-08-19', gender: 'Female', className: 'Class 7', section: 'A', parentName: 'Anil Kapoor', contact: '+91 96543 21098', address: '12, Sector 21, Gurugram' },
  { studentId: 'STU-2026-0149', name: 'Reyansh Gupta', dob: '2009-05-22', gender: 'Male', className: 'Class 10', section: 'B', parentName: 'Manoj Gupta', contact: '+91 95432 10987', address: '56, Civil Lines, Delhi' },
  { studentId: 'STU-2026-0150', name: 'Saanvi Joshi', dob: '2011-12-01', gender: 'Female', className: 'Class 8', section: 'C', parentName: 'Vikram Joshi', contact: '+91 94321 09876', address: '90, FC Road, Pune' },
  { studentId: 'STU-2026-0151', name: 'Arjun Menon', dob: '2010-07-14', gender: 'Male', className: 'Class 9', section: 'C', parentName: 'Sunita Menon', contact: '+91 93210 98765', address: '5, Panampilly Nagar, Kochi' },
  { studentId: 'STU-2026-0152', name: 'Aditi Verma', dob: '2012-02-25', gender: 'Female', className: 'Class 6', section: 'A', parentName: 'Deepak Verma', contact: '+91 92109 87654', address: '32, Vasant Kunj, Delhi' },
  { studentId: 'STU-2026-0153', name: 'Vihaan Rao', dob: '2009-10-09', gender: 'Male', className: 'Class 11', section: 'A', parentName: 'Lakshmi Rao', contact: '+91 91098 76543', address: '18, Indiranagar, Bengaluru' },
]

export const emptyStudent = () => ({
  studentId: '', name: '', dob: '', gender: '', className: '', section: '',
  parentName: '', contact: '', address: '',
})
