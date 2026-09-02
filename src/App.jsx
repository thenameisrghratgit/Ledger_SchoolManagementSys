import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProtectedRoute from './components/admin/ProtectedRoute.jsx'

// Admin
import AdminLayout from './components/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Students from './pages/admin/Students.jsx'
import Teachers from './pages/admin/Teachers.jsx'
import AdminAttendance from './pages/admin/Attendance.jsx'
import Examinations from './pages/admin/Examinations.jsx'
import Timetable from './pages/admin/Timetable.jsx'
import Fees from './pages/admin/Fees.jsx'
import Reports from './pages/admin/Reports.jsx'
import Settings from './pages/admin/Settings.jsx'

// Student
import StudentLayout from './components/student/StudentLayout.jsx'
import StudentDashboard from './pages/student/Dashboard.jsx'
import StudentTimetable from './pages/student/Timetable.jsx'
import StudentAttendance from './pages/student/Attendance.jsx'
import StudentExaminations from './pages/student/Examinations.jsx'
import StudentFees from './pages/student/Fees.jsx'
import StudentProfile from './pages/student/Profile.jsx'

// Teacher
import TeacherLayout from './components/teacher/TeacherLayout.jsx'
import TeacherDashboard from './pages/teacher/Dashboard.jsx'
import TeacherMyClasses from './pages/teacher/MyClasses.jsx'
import TeacherAttendance from './pages/teacher/Attendance.jsx'
import TeacherExaminations from './pages/teacher/Examinations.jsx'
import TeacherProfile from './pages/teacher/Profile.jsx'

// Parent
import ParentLayout from './components/parent/ParentLayout.jsx'
import ParentDashboard from './pages/parent/Dashboard.jsx'
import ParentAttendance from './pages/parent/Attendance.jsx'
import ParentFees from './pages/parent/Fees.jsx'
import ParentExaminations from './pages/parent/Examinations.jsx'
import ParentProfile from './pages/parent/Profile.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin portal */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="examinations" element={<Examinations />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="fees" element={<Fees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Student portal */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="examinations" element={<StudentExaminations />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Teacher portal */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<TeacherMyClasses />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="examinations" element={<TeacherExaminations />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      {/* Parent portal */}
      <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout /></ProtectedRoute>}>
        <Route index element={<ParentDashboard />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="fees" element={<ParentFees />} />
        <Route path="examinations" element={<ParentExaminations />} />
        <Route path="profile" element={<ParentProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
