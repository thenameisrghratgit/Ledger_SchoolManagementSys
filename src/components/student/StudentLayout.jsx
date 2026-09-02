import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, ClipboardCheck, FileText, Wallet, UserCircle } from 'lucide-react'
import RoleSidebar from '../shared/RoleSidebar.jsx'
import RoleTopbar from '../shared/RoleTopbar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = [
  { label: 'Dashboard',    to: '/student',              icon: LayoutDashboard, end: true },
  { label: 'Timetable',    to: '/student/timetable',    icon: CalendarDays },
  { label: 'Attendance',   to: '/student/attendance',   icon: ClipboardCheck },
  { label: 'Examinations', to: '/student/examinations', icon: FileText },
  { label: 'Fees',         to: '/student/fees',         icon: Wallet },
  { label: 'Profile',      to: '/student/profile',      icon: UserCircle },
]

const TITLES = {
  '/student':              'Dashboard',
  '/student/timetable':    'Timetable',
  '/student/attendance':   'Attendance',
  '/student/examinations': 'Examinations',
  '/student/fees':         'Fees',
  '/student/profile':      'Profile',
}

export default function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <div className="min-h-screen bg-surface">
      <RoleSidebar navItems={NAV} portalLabel="Student Portal" gliderColor="#3B82F6"
        onLogout={handleLogout} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-col lg:ml-[240px]">
        <RoleTopbar title={TITLES[location.pathname] || 'Student'} portalLabel="Ledgerhall Student Portal"
          accentColor="#3B82F6" onOpenMobile={() => setMobileOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 px-5 py-6 sm:px-7 sm:py-8"><Outlet /></main>
      </div>
    </div>
  )
}
