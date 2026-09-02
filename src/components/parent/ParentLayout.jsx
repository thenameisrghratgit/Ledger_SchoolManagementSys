import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardCheck, Wallet, FileText, UserCircle } from 'lucide-react'
import RoleSidebar from '../shared/RoleSidebar.jsx'
import RoleTopbar from '../shared/RoleTopbar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = [
  { label: 'Dashboard',    to: '/parent',              icon: LayoutDashboard, end: true },
  { label: 'Attendance',   to: '/parent/attendance',   icon: ClipboardCheck },
  { label: 'Fees',         to: '/parent/fees',         icon: Wallet },
  { label: 'Examinations', to: '/parent/examinations', icon: FileText },
  { label: 'Profile',      to: '/parent/profile',      icon: UserCircle },
]

const TITLES = {
  '/parent':              'Dashboard',
  '/parent/attendance':   'Attendance',
  '/parent/fees':         'Fees',
  '/parent/examinations': 'Examinations',
  '/parent/profile':      'Profile',
}

export default function ParentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <div className="min-h-screen bg-surface">
      <RoleSidebar navItems={NAV} portalLabel="Parent Portal" gliderColor="#7C3AED"
        onLogout={handleLogout} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-col lg:ml-[240px]">
        <RoleTopbar title={TITLES[location.pathname] || 'Parent'} portalLabel="Ledgerhall Parent Portal"
          accentColor="#7C3AED" onOpenMobile={() => setMobileOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 px-5 py-6 sm:px-7 sm:py-8"><Outlet /></main>
      </div>
    </div>
  )
}
