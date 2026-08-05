import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({ label = 'Password', error, className = '', ...props }) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={18}
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
            focused ? 'text-royal-500' : 'text-ink-300'
          }`}
        />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className={`focus-ring w-full rounded-xl border bg-white/70 py-2.5 pl-11 pr-11 text-[15px] text-ink-900 placeholder:text-ink-300 transition-all duration-200 ${
            error
              ? 'border-rose-300 focus-visible:ring-rose-300'
              : 'border-ink-100 hover:border-ink-200'
          }`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="focus-ring absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 transition-colors hover:text-royal-500 rounded"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {focused && !error && (
          <motion.span
            className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-royal-400 via-royal-500 to-gold-400"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}
