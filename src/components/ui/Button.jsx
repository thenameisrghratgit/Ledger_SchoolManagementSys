import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  const widthClass = className.includes('w-auto') ? '' : 'w-full'
  const base =
    `focus-ring inline-flex ${widthClass} items-center justify-center gap-2 rounded-lg px-5 py-3 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60`

  const variants = {
    primary: 'border border-navy bg-navy text-white shadow-sm hover:bg-navy-deep hover:border-navy-deep',
    secondary:
      'border border-border bg-surface-card text-text hover:border-[#C6D0DB] hover:bg-surface',
    ghost: 'text-navy hover:bg-surface',
  }

  return (
    <button
      type={type}
      disabled={loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
}
