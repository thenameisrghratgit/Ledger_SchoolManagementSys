import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function SelectInput({
  label,
  icon: Icon,
  error,
  options = [],
  placeholder = 'Select an option',
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
        <select
          id={id}
          defaultValue=""
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className={`focus-ring w-full appearance-none rounded-xl border bg-white/70 py-2.5 pr-10 text-[15px] text-ink-900 transition-all duration-200 ${
            Icon ? 'pl-11' : 'px-3.5'
          } ${
            error
              ? 'border-rose-300 focus-visible:ring-rose-300'
              : 'border-ink-100 hover:border-ink-200'
          }`}
          {...props}
        >
          <option value="" disabled className="text-ink-300">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300"
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}
