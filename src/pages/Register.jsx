import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, Presentation, Users, CheckCircle2 } from 'lucide-react'
import RoleCard from '../components/register/RoleCard.jsx'
import StudentForm from '../components/register/StudentForm.jsx'
import TeacherForm from '../components/register/TeacherForm.jsx'
import ParentForm from '../components/register/ParentForm.jsx'
import SealMark from '../components/SealMark.jsx'
import Button from '../components/ui/Button.jsx'

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    description: 'Access classes, assignments, grades, and your attendance record.',
    Icon: GraduationCap,
    accent: 'bg-royal-100 text-royal-600',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    description: 'Manage classes, mark attendance, and share progress with parents.',
    Icon: Presentation,
    accent: 'bg-gold-100 text-gold-600',
  },
  {
    key: 'parent',
    label: 'Parent',
    description: "Follow your child's academics, attendance, and school updates.",
    Icon: Users,
    accent: 'bg-ink-100 text-ink-600',
  },
]

export default function Register() {
  const [role, setRole] = useState(null)
  const [submitted, setSubmitted] = useState(null) // { roleLabel, needsVerification }

  const handleSuccess = (roleLabel, opts = {}) => setSubmitted({ roleLabel, ...opts })

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-50 via-white to-royal-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/70 p-10 text-center shadow-card backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-royal-50 text-royal-600"
          >
            <CheckCircle2 size={32} />
          </motion.div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">
            {submitted.roleLabel} account created
          </h1>
          <p className="mt-2 text-[15px] text-ink-400">
            {submitted.needsVerification
              ? 'Your account was created. Check your email for a verification link, then sign in.'
              : 'Your account is ready. You can sign in now.'}
          </p>
          <Link to="/login" className="mt-8 block">
            <Button>Go to sign in</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-royal-50 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-600 to-ink-800 text-gold-200 shadow-glow">
            <SealMark size={28} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            Create your Ledgerhall account
          </h1>
          <p className="mt-2 max-w-md text-[15px] text-ink-400">
            {role
              ? 'Fill in the details below to finish setting up your account.'
              : 'First, tell us who you are — the form adjusts to match your role.'}
          </p>
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div
                key="roles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-3"
              >
                {ROLES.map((r, i) => (
                  <motion.div
                    key={r.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <RoleCard role={r} selected={role === r.key} onSelect={setRole} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key={role} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {role === 'student' && <StudentForm onBack={() => setRole(null)} onSuccess={handleSuccess} />}
                {role === 'teacher' && <TeacherForm onBack={() => setRole(null)} onSuccess={handleSuccess} />}
                {role === 'parent' && <ParentForm onBack={() => setRole(null)} onSuccess={handleSuccess} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-[15px] text-ink-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="focus-ring rounded font-semibold text-royal-600 hover:text-royal-700 hover:underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
