import { useEffect, useRef, useState } from 'react'
import { Menu, ChevronDown, LogOut, User, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RoleTopbar({ title, portalLabel, accentColor = '#1C3A28', onOpenMobile, onLogout }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = (user?.name || 'User')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    const onOut = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false) }
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onOut)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onOut); document.removeEventListener('keydown', onEsc) }
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between bg-surface-card px-5 sm:px-7"
      style={{ borderBottom: '1px solid #E8E2DA' }}>
      <div className="flex items-center gap-3">
        <button onClick={onOpenMobile} className="focus-ring -ml-1 rounded-lg p-2 text-text-secondary hover:bg-surface lg:hidden" aria-label="Open sidebar">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-text leading-none uppercase">{title}</h1>
          <p className="text-[11px] text-text-secondary mt-1 hidden sm:block">{portalLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="focus-ring relative rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
            className="focus-ring flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-surface transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})` }}>
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[13px] font-semibold leading-tight text-text">{user?.name || 'User'}</p>
              <p className="text-[11px] leading-tight text-text-secondary capitalize">{user?.role || ''}</p>
            </div>
            <ChevronDown size={14} className={`hidden text-text-secondary transition-transform duration-150 sm:block ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-xl border border-border bg-surface-card shadow-card-hover">
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #E8E2DA' }}>
                <p className="truncate text-[13px] font-semibold text-text">{user?.name || 'User'}</p>
                <p className="truncate text-[12px] text-text-secondary">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button role="menuitem" onClick={() => setOpen(false)}
                  className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-text hover:bg-surface transition-colors">
                  <User size={15} strokeWidth={1.8} className="text-text-secondary" /> My Profile
                </button>
                <button role="menuitem" onClick={() => { setOpen(false); onLogout?.() }}
                  className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                  <LogOut size={15} strokeWidth={1.8} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
