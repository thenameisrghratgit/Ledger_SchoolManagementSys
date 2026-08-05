import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function FormShell({ title, subtitle, icon: Icon, accent, onBack, children, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-3xl rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur-xl sm:p-9"
    >
      <button
        type="button"
        onClick={onBack}
        className="focus-ring mb-6 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-400 hover:text-royal-600"
      >
        <ArrowLeft size={16} />
        Change role
      </button>

      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={22} />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
        {children}
      </form>
    </motion.div>
  )
}
