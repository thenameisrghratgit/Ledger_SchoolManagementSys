export const DEPARTMENT_OPTIONS = [
  'Sciences', 'Mathematics', 'Languages', 'Social Studies', 'Arts & Physical Ed',
]

export const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Fine Arts',
]

export const emptyTeacher = () => ({
  teacherId: '', name: '', department: '', subjects: [],
  contact: '', email: '', experience: '', classes: '', status: 'Active',
})
