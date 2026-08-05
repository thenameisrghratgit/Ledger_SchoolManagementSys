import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Users, PenSquare, Award } from 'lucide-react'
import SealMark from './SealMark.jsx'

const floaters = [
  { Icon: BookOpen, top: '14%', left: '18%', delay: 0, cls: 'animate-drift' },
  { Icon: GraduationCap, top: '68%', left: '12%', delay: 0.2, cls: 'animate-drift-slow' },
  { Icon: Users, top: '22%', left: '78%', delay: 0.1, cls: 'animate-drift-slow' },
  { Icon: PenSquare, top: '76%', left: '72%', delay: 0.3, cls: 'animate-drift' },
  { Icon: Award, top: '46%', left: '86%', delay: 0.15, cls: 'animate-drift' },
]

export default function AuthIllustration({
  eyebrow = 'Ledgerhall Institute',
  title = 'One record, every classroom.',
  copy = 'A single, well-kept ledger for admissions, attendance, and every parent-teacher thread in between.',
}) {
  return (
    <div className="relative hidden h-full w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-ink-900 via-ink-800 to-royal-800 lg:flex lg:flex-col lg:justify-between">
      {/* dotted texture */}
      <div className="absolute inset-0 bg-seal-grid opacity-40 [background-size:18px_18px]" />

      {/* floating academic icons */}
      {floaters.map(({ Icon, top, left, delay, cls }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{ delay: 0.6 + delay, duration: 0.6 }}
          style={{ top, left }}
          className={`absolute ${cls}`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm">
            <Icon size={18} className="text-gold-200" />
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 p-10 xl:p-12">
        <div className="flex items-center gap-2.5 text-gold-200">
          <SealMark size={30} />
          <span className="font-display text-lg tracking-wide">{eyebrow}</span>
        </div>
      </div>

      <div className="relative z-10 px-10 pb-12 xl:px-12 xl:pb-14">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-sm font-display text-[2.1rem] leading-[1.15] text-white"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-200"
        >
          {copy}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-9 flex items-center gap-6 border-t border-white/10 pt-6"
        >
        </motion.div>
      </div>
    </div>
  )
}
