import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, ClipboardCheck, FileText, UserCircle } from 'lucide-react'
import RoleSidebar from '../shared/RoleSidebar.jsx'
import RoleTopbar from '../shared/RoleTopbar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = [
  { label: 'Dashboard',    to: '/teacher',              icon: LayoutDashboard, end: true },
  { label: 'My Classes',   to: '/teacher/classes',      icon: CalendarDays },
  { label: 'Attendance',   to: '/teacher/attendance',   icon: ClipboardCheck },
  { label: 'Examinations', to: '/teacher/examinations', icon: FileText },
  { label: 'Profile',      to: '/teacher/profile',      icon: UserCircle },
]

const TITLES = {
  '/teacher':              'Dashboard',
  '/teacher/classes':      'My Classes',
  '/teacher/attendance':   'Attendance',
  '/teacher/examinations': 'Examinations',
  '/teacher/profile':      'Profile',
}

export default function TeacherLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <div className="min-h-screen bg-surface">
      <RoleSidebar navItems={NAV} portalLabel="Teacher Portal" gliderColor="#C4622D"
        onLogout={handleLogout} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-col lg:ml-[240px]">
        <RoleTopbar title={TITLES[location.pathname] || 'Teacher'} portalLabel="Ledgerhall Teacher Portal"
          accentColor="#C4622D" onOpenMobile={() => setMobileOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 px-5 py-6 sm:px-7 sm:py-8"><Outlet /></main>
      </div>
    </div>
  )
}
