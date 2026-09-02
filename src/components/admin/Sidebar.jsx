import { useLocation, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, ClipboardCheck,
  FileText, CalendarDays, Wallet, BarChart3, Settings, LogOut,
} from 'lucide-react'
import SealMark from '../SealMark.jsx'

const NAV_ITEMS = [
  { label: 'Dashboard',    to: '/admin',              icon: LayoutDashboard, end: true },
  { label: 'Students',     to: '/admin/students',     icon: Users },
  { label: 'Teachers',     to: '/admin/teachers',     icon: GraduationCap },
  { label: 'Attendance',   to: '/admin/attendance',   icon: ClipboardCheck },
  { label: 'Examinations', to: '/admin/examinations', icon: FileText },
  { label: 'Timetable',    to: '/admin/timetable',    icon: CalendarDays },
  { label: 'Fees',         to: '/admin/fees',         icon: Wallet },
  { label: 'Reports',      to: '/admin/reports',      icon: BarChart3 },
  { label: 'Settings',     to: '/admin/settings',     icon: Settings },
]

const ITEM_H = 52    // px — height of each nav row
const NAV_TOP = 16   // px — top padding of <nav> (py-4)

export default function Sidebar({ onLogout, mobileOpen, onCloseMobile }) {
  const location = useLocation()

  const activeIdx = NAV_ITEMS.findIndex(({ to, end }) =>
    end ? location.pathname === to : location.pathname.startsWith(to)
  )
  const idx = activeIdx >= 0 ? activeIdx : 0

  return (
    <>
      {/* Mobile scrim */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[240px] flex-col
          bg-navy-deep transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* ── Brand ── */}
        <div
          className="flex h-[80px] shrink-0 items-center gap-3.5 px-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gold-300"
            style={{
              background: 'linear-gradient(135deg, rgba(196,161,91,0.15) 0%, rgba(18,38,24,0.6) 100%)',
              border: '1px solid rgba(196,161,91,0.25)',
            }}
          >
            <SealMark size={28} animate={true} />
          </div>
          <div className="flex flex-col justify-center" style={{ overflow: 'visible' }}>
            <p
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Ledgerhall
            </p>
            <p
              style={{
                marginTop: '3px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'rgba(255,255,255,0.55)',
                whiteSpace: 'nowrap',
              }}
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="relative flex-1 overflow-y-auto py-4">
          {/* Static track line */}
          <div
            className="absolute left-[22px] top-0 bottom-0 w-px"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)',
            }}
          />

          {/* Glowing glider — uses translateY so transition-transform works */}
          <div
            className="absolute left-[22px] w-px pointer-events-none"
            style={{
              top: `${NAV_TOP}px`,
              height: `${ITEM_H}px`,
              transform: `translateY(${idx * ITEM_H}px)`,
              transition: 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Glowing line */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, transparent 0%, #C4A15B 30%, #C4A15B 70%, transparent 100%)',
              }}
            />
            {/* Horizontal glow halo */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: 0,
                height: '70%',
                width: '180px',
                background: '#C4A15B',
                filter: 'blur(14px)',
                opacity: 0.16,
              }}
            />
            {/* Row highlight fade */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '200px',
                background:
                  'linear-gradient(90deg, rgba(196,161,91,0.09) 0%, transparent 100%)',
              }}
            />
          </div>

          <ul>
            {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => {
              const isActive = end
                ? location.pathname === to
                : location.pathname.startsWith(to)
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onCloseMobile}
                    className="group flex items-center gap-3.5 pl-10 pr-4"
                    style={{
                      height: `${ITEM_H}px`,
                      color: isActive ? '#C4A15B' : 'rgba(255,255,255,0.42)',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    <Icon
                      size={17}
                      strokeWidth={isActive ? 2.1 : 1.7}
                      style={{
                        flexShrink: 0,
                        color: isActive ? '#C4A15B' : 'rgba(255,255,255,0.38)',
                        transition: 'color 0.2s ease',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? 600 : 500,
                        letterSpacing: '0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        transition: 'font-weight 0.2s ease',
                      }}
                    >
                      {label}
                    </span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* ── Logout ── */}
        <div
          className="shrink-0 p-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3.5 rounded-lg px-4 py-3"
            style={{
              fontSize: '13.5px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.38)',
              transition: 'color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f87171'
              e.currentTarget.style.background = 'rgba(248,113,113,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.38)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
