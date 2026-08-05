import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary:
      'bg-gradient-to-br from-royal-500 to-royal-700 text-white shadow-[0_8px_20px_-8px_rgba(41,85,163,0.55)] hover:shadow-[0_12px_28px_-8px_rgba(41,85,163,0.65)] hover:from-royal-400 hover:to-royal-600',
    secondary:
      'border border-ink-100 bg-white text-ink-700 hover:border-royal-200 hover:bg-royal-50',
    ghost: 'text-royal-600 hover:bg-royal-50',
  }

  return (
    <motion.button
      type={type}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </motion.button>
  )
}
