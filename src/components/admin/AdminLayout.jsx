import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/students': 'Students',
  '/admin/teachers': 'Teachers',
  '/admin/attendance': 'Attendance',
  '/admin/examinations': 'Examinations',
  '/admin/timetable': 'Timetable',
  '/admin/fees': 'Fees',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const title = TITLES[location.pathname] || 'Admin'

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ease-in-out ${collapsed ? 'lg:ml-[76px]' : 'lg:ml-[248px]'}`}>
        <Topbar title={title} onOpenMobile={() => setMobileOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 px-5 py-6 sm:px-7 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
