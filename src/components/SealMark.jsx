import { motion } from 'framer-motion'

// Total cycle = last path ends (0.75+1.1=1.85s) + 0.5s pause = 2.35s
// Each path uses keyframes so all stay in sync on every loop
const CYCLE = 2.35

function pathAnim(animate, delay, dur = 1.1) {
  if (!animate) return {
    pathLength: { delay, duration: dur, ease: [0.65, 0, 0.35, 1] },
    opacity:    { delay, duration: 0.3 },
  }
  const t0 = delay / CYCLE
  const t1 = (delay + dur) / CYCLE
  return {
    pathLength: {
      duration: CYCLE,
      ease: 'linear',
      times: t0 === 0 ? [0, t1, 1] : [0, t0, t1, 1],
      repeat: Infinity,
      repeatType: 'loop',
    },
    opacity: {
      duration: CYCLE,
      ease: 'linear',
      times: t0 === 0 ? [0, Math.min(0.3 / CYCLE, t1), 1] : [0, t0, Math.min(t0 + 0.3 / CYCLE, t1), 1],
      repeat: Infinity,
      repeatType: 'loop',
    },
  }
}

export default function SealMark({ size = 56, animate = true, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hex ring — starts immediately */}
      <motion.path
        d="M32 3 L59 17.5 V46.5 L32 61 L5 46.5 V17.5 Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={animate
          ? { pathLength: [0, 1, 1], opacity: [0, 1, 1] }
          : { pathLength: 1, opacity: 1 }}
        transition={pathAnim(animate, 0)}
      />

      {/* Mortarboard cap */}
      <motion.path
        d="M18 26.5 L32 20 L46 26.5 L32 33 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={animate
          ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] }
          : { pathLength: 1, opacity: 1 }}
        transition={pathAnim(animate, 0.3)}
      />

      {/* Gown arc */}
      <motion.path
        d="M23 29.6 V38 C23 40 27 42 32 42 C37 42 41 40 41 38 V29.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={animate
          ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] }
          : { pathLength: 1, opacity: 1 }}
        transition={pathAnim(animate, 0.55)}
      />

      {/* Tassel pole */}
      <motion.path
        d="M46 26.5 V34.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={animate
          ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] }
          : { pathLength: 1, opacity: 1 }}
        transition={pathAnim(animate, 0.75)}
      />

      {/* Tassel dot */}
      <motion.circle
        cx="46"
        cy="37"
        r="1.8"
        fill="currentColor"
        initial={{ opacity: 0, scale: 0 }}
        animate={animate
          ? { opacity: [0, 0, 1, 1], scale: [0, 0, 1, 1] }
          : { opacity: 1, scale: 1 }}
        transition={animate ? {
          duration: CYCLE,
          ease: 'linear',
          times: [0, 1.05 / CYCLE, (1.05 + 0.25) / CYCLE, 1],
          repeat: Infinity,
          repeatType: 'loop',
        } : { delay: 1.05, duration: 0.25 }}
        style={{ transformOrigin: '46px 37px' }}
      />
    </svg>
  )
}
