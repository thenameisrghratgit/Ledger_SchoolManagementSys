import { useId, useState } from 'react'
import { motion } from 'framer-motion'

export default function TextInput({
  label,
  icon: Icon,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  const id = useId()
  const [focused, setFocused] = useState(false)

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              focused ? 'text-royal-500' : 'text-ink-300'
            }`}
          />
        )}
        <input
          id={id}
          type={type}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className={`focus-ring w-full rounded-xl border bg-white/70 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-300 transition-all duration-200 ${
            Icon ? 'pl-11 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-rose-300 focus-visible:ring-rose-300'
              : 'border-ink-100 hover:border-ink-200'
          }`}
          {...props}
        />
        {focused && !error && (
          <motion.span
            layoutId={`underline-${id}`}
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
