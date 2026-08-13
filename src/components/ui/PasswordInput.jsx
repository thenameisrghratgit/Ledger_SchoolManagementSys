import { useId, useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({ label = 'Password', error, className = '', ...props }) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={18}
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
            focused ? 'text-navy' : 'text-text-secondary'
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
          className={`focus-ring w-full rounded-lg border bg-surface-card py-2.5 pl-11 pr-11 text-[15px] text-text placeholder:text-text-secondary transition-colors duration-150 ${
            error
              ? 'border-rose-300 focus-visible:ring-rose-300'
              : 'border-border hover:border-[#C6D0DB] focus:border-navy focus:ring-navy/10'
          }`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="focus-ring absolute right-3.5 top-1/2 -translate-y-1/2 rounded text-text-secondary transition-colors hover:text-navy"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}
