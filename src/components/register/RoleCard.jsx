import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function RoleCard({ role, selected, onSelect }) {
  const { key, label, description, Icon, accent } = role

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(key)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={`focus-ring relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border p-6 text-left transition-colors duration-200 ${
        selected
          ? 'border-royal-300 bg-royal-50/70 shadow-card-hover'
          : 'border-ink-100 bg-white/70 hover:border-royal-200 hover:bg-royal-50/30'
      }`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0, rotate: -18, opacity: 0 }}
          animate={{ scale: 1, rotate: -8, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-royal-600 text-white shadow-glow"
        >
          <Check size={16} strokeWidth={3} />
        </motion.div>
      )}

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${accent}`}
        aria-hidden
      >
        <Icon size={22} />
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink-900">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-400">{description}</p>
      </div>
    </motion.button>
  )
}
