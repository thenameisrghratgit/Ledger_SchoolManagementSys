import { useId, useState } from 'react'

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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              focused ? 'text-navy' : 'text-text-secondary'
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
          className={`focus-ring w-full rounded-lg border bg-surface-card py-2.5 text-[15px] text-text placeholder:text-text-secondary transition-colors duration-150 ${
            Icon ? 'pl-11 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-rose-300 focus-visible:ring-rose-300'
              : 'border-border hover:border-[#C6D0DB] focus:border-navy focus:ring-navy/10'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}
