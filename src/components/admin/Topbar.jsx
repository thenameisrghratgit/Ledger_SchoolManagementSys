import { useEffect, useRef, useState } from 'react'
import { Menu, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Topbar({ title, onOpenMobile, onLogout }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = (user?.name || 'Admin')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-card px-5 sm:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="focus-ring -ml-1 rounded-lg p-2 text-text-secondary hover:bg-surface lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-text">{title}</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="focus-ring flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-surface"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[12px] font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-[13px] font-semibold leading-tight text-text">{user?.name || 'Administrator'}</p>
            <p className="text-[12px] leading-tight text-text-secondary">Admin</p>
          </div>
          <ChevronDown
            size={16}
            className={`hidden text-text-secondary transition-transform duration-150 sm:block ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-lg border border-border bg-surface-card shadow-card-hover"
          >
            <div className="border-b border-border px-3.5 py-3">
              <p className="truncate text-[13px] font-semibold text-text">{user?.name || 'Administrator'}</p>
              <p className="truncate text-[12px] text-text-secondary">{user?.email}</p>
            </div>
            <div className="p-1.5">
              <button
                role="menuitem"
                onClick={() => setOpen(false)}
                className="focus-ring flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px] text-text hover:bg-surface"
              >
                <User size={16} strokeWidth={1.8} className="text-text-secondary" />
                My Profile
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onLogout?.()
                }}
                className="focus-ring flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px] font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} strokeWidth={1.8} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
