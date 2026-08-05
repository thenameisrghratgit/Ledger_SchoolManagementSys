import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'
import TextInput from '../components/ui/TextInput.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import SealMark from '../components/SealMark.jsx'
import AuthIllustration from '../components/AuthIllustration.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.email) next.email = 'Enter your email address.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Enter your password.'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setNotice('')
    if (!validate()) return
    setLoading(true)
    // Frontend-only demo: simulate a request
    setTimeout(() => {
      setLoading(false)
      setNotice('This is a UI demo — no account was actually signed in.')
    }, 1100)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-50 via-white to-royal-50 p-4 sm:p-6 lg:p-10">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        {/* Illustration side */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden lg:block"
        >
          <AuthIllustration />
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur-xl sm:p-10">
            {/* Logo + title */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-royal-600 to-ink-800 text-gold-200 shadow-glow"
              >
                <SealMark size={34} />
              </motion.div>
              <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900 sm:text-[1.7rem]">
                Ledgerhall School Management
              </h1>
              <p className="mt-2 text-[15px] text-ink-400">
                Welcome back. Sign in to reach your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <TextInput
                label="Email address"
                icon={Mail}
                type="email"
                placeholder="you@ledgerhall.edu"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={update('password')}
                error={errors.password}
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-500">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={update('remember')}
                    className="focus-ring h-4 w-4 rounded border-ink-300 text-royal-600 accent-royal-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setNotice('Password reset is not wired up in this UI demo.')}
                  className="focus-ring rounded text-sm font-medium text-royal-600 hover:text-royal-700 hover:underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              {notice && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-royal-50 px-3.5 py-2.5 text-sm text-royal-700"
                >
                  {notice}
                </motion.p>
              )}

              <Button type="submit" loading={loading} className="mt-1 group">
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                )}
              </Button>
            </form>

            <div className="mt-7 flex items-center gap-3 text-ink-300">
              <div className="h-px flex-1 bg-ink-100" />
              <span className="text-xs uppercase tracking-wider">New here</span>
              <div className="h-px flex-1 bg-ink-100" />
            </div>

            <p className="mt-5 text-center text-[15px] text-ink-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="focus-ring rounded font-semibold text-royal-600 hover:text-royal-700 hover:underline underline-offset-2"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
