import { motion } from 'framer-motion'

/**
 * The Ledgerhall seal — a hexagonal emblem combining a mortarboard
 * and an open book. This is the signature visual motif reused across
 * the login illustration, the brand mark, and the role-selection
 * "stamp" animation on the register page.
 */
export default function SealMark({ size = 56, animate = true, className = '' }) {
  const pathTransition = (delay) => ({
    pathLength: { delay, duration: 1.1, ease: [0.65, 0, 0.35, 1] },
    opacity: { delay, duration: 0.3 },
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M32 3 L59 17.5 V46.5 L32 61 L5 46.5 V17.5 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : false}
        transition={pathTransition(0)}
      />
      <motion.path
        d="M18 26.5 L32 20 L46 26.5 L32 33 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : false}
        transition={pathTransition(0.3)}
      />
      <motion.path
        d="M23 29.6 V38 C23 40 27 42 32 42 C37 42 41 40 41 38 V29.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : false}
        transition={pathTransition(0.55)}
      />
      <motion.path
        d="M46 26.5 V34.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : false}
        transition={pathTransition(0.75)}
      />
      <motion.circle
        cx="46"
        cy="37"
        r="1.6"
        fill="currentColor"
        initial={animate ? { opacity: 0, scale: 0 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : false}
        transition={{ delay: 1.05, duration: 0.25 }}
      />
    </svg>
  )
}
