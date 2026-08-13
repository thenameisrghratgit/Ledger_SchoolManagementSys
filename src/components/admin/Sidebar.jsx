import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  FileText,
  CalendarDays,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import SchoolLogo from '../SchoolLogo.jsx'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Students', to: '/admin/students', icon: Users },
  { label: 'Teachers', to: '/admin/teachers', icon: GraduationCap },
  { label: 'Attendance', to: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Examinations', to: '/admin/examinations', icon: FileText },
  { label: 'Timetable', to: '/admin/timetable', icon: CalendarDays },
  { label: 'Fees', to: '/admin/fees', icon: Wallet },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export default function Sidebar({ collapsed, onToggle, onLogout, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Mobile scrim */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-navy-deep/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-navy-deep text-white transition-all duration-200 ease-in-out
          ${collapsed ? 'lg:w-[76px]' : 'lg:w-[248px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-[248px]`}
      >
        {/* Brand */}
        <div className={`flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-4 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <SchoolLogo size={30} />
          {!collapsed && <span className="truncate text-[15px] font-semibold tracking-tight">Ledgerhall</span>}
        </div>

        {/* Nav */}
        <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `focus-ring group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-gold/15 text-gold'
                        : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                    } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon size={19} className="shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: collapse toggle + logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            onClick={onToggle}
            className={`focus-ring mb-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white lg:flex ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            {collapsed ? <ChevronsRight size={19} strokeWidth={1.8} /> : <ChevronsLeft size={19} strokeWidth={1.8} />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={onLogout}
            className={`focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/70 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={19} strokeWidth={1.8} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
