import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import SealMark from '../components/SealMark.jsx'
import { SparklesCore } from '../components/ui/Sparkles.jsx'

const highlights = [
  'Manage students, attendance & exams',
  'Real-time parent communication',
  'Fee collection & financial reports',
  'Works on all devices, anywhere',
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.email) next.email = 'Enter your email address.'
    if (!form.password) next.password = 'Enter your password.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setNotice('')
    if (!validate()) return
    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      if (result.ok) {
        const portals = { admin: '/admin', student: '/student', teacher: '/teacher', parent: '/parent' }
        navigate(location.state?.from || portals[result.role] || '/', { replace: true })
      } else {
        setNotice(result.error)
      }
    } catch {
      setNotice('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-navy via-navy-deep to-navy flex items-center justify-center px-4 py-10">

      {/* Sparkles */}
      <SparklesCore
        background="transparent"
        minSize={0.3}
        maxSize={1.2}
        particleDensity={260}
        particleColor="#D4B87A"
        speed={0.35}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl flex items-start gap-12 lg:gap-20 pt-10">

        {/* ── Left: branding panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-1 flex-col"
        >
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <motion.div
                className="absolute -inset-1.5 rounded-2xl"
                style={{ background: 'radial-gradient(circle, rgba(196,162,91,0.3) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-deep/80 to-navy-deep border border-white/10 text-gold-300 shadow-xl">
                <SealMark size={42} animate={true} />
              </div>
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-white tracking-tight">Ledgerhall</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-100/50">
                School Management System
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-10">
            <h2 className="font-serif text-4xl font-bold text-white leading-[1.15]">
              Your School,<br />
              <span className="text-gold-300">All in One Place</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gold-100/65 max-w-sm">
              Manage admissions, attendance, exams, fees, and parent
              communication from a single intuitive platform.
            </p>
          </div>

          {/* Highlights */}
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-gold-100/70">
                <CheckCircle2 size={16} className="flex-shrink-0 text-gold-400" />
                {h}
              </li>
            ))}
          </ul>

          {/* Decorative seal watermark */}
          <div className="mt-14 opacity-[0.04]">
            <SealMark size={160} animate={false} className="text-white" />
          </div>
        </motion.div>

        {/* ── Right: login card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="w-full lg:w-[380px] flex-shrink-0"
        >
          <div className="rounded-[20px] bg-white px-7 py-8 shadow-2xl">

            {/* Mobile-only logo */}
            <div className="flex flex-col items-center gap-2 mb-6 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-deep text-gold-300">
                <SealMark size={30} animate={true} />
              </div>
              <h1 className="font-serif text-xl font-bold text-text">Ledgerhall</h1>
            </div>

            <h2 className="text-[1.2rem] font-bold text-text">Welcome back</h2>
            <p className="mt-1 text-sm text-text-secondary">Sign in to your school account</p>

            <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-3.5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-text mb-1.5">Email</label>
                <div className={`flex items-center gap-2.5 rounded-xl border px-3 h-[48px] transition-colors ${
                  errors.email ? 'border-rose-300' : 'border-[#ecedec] focus-within:border-navy'
                }`}>
                  <Mail size={17} className="flex-shrink-0 text-text-secondary" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update('email')}
                    className="flex-1 border-none bg-transparent text-[14px] text-text placeholder:text-text-secondary/50 focus:outline-none"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-text mb-1.5">Password</label>
                <div className={`flex items-center gap-2.5 rounded-xl border px-3 h-[48px] transition-colors ${
                  errors.password ? 'border-rose-300' : 'border-[#ecedec] focus-within:border-navy'
                }`}>
                  <Lock size={17} className="flex-shrink-0 text-text-secondary" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={update('password')}
                    className="flex-1 border-none bg-transparent text-[14px] text-text placeholder:text-text-secondary/50 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    className="flex-shrink-0 text-text-secondary hover:text-text transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={form.remember} onChange={update('remember')}
                    className="h-4 w-4 rounded border-border accent-navy" />
                  Remember me
                </label>
                <button type="button"
                  onClick={() => setNotice('Password reset is not available in this demo.')}
                  className="text-sm font-medium text-navy hover:underline underline-offset-2">
                  Forgot password?
                </button>
              </div>

              {/* Notice */}
              {notice && (
                <p className={`rounded-xl border px-3 py-2.5 text-sm ${
                  notice.toLowerCase().includes('invalid')
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-border bg-surface text-text-secondary'
                }`}>{notice}</p>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-navy h-[48px] text-[14px] font-semibold text-white shadow-md transition-all hover:bg-navy-deep hover:shadow-lg disabled:opacity-60 mt-0.5">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#ecedec]" />
              <span className="text-xs text-text-secondary">Or With</span>
              <div className="h-px flex-1 bg-[#ecedec]" />
            </div>

            {/* Social */}
            <div className="flex gap-2.5">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ededef] bg-white h-[44px] text-[13px] font-medium text-text transition-colors hover:border-navy/25 hover:bg-surface">
                <svg width="16" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FBBB00" d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z"/>
                  <path fill="#518EF8" d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176z"/>
                  <path fill="#28B446" d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"/>
                  <path fill="#F14336" d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z"/>
                </svg>
                Google
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ededef] bg-white h-[44px] text-[13px] font-medium text-text transition-colors hover:border-navy/25 hover:bg-surface">
                <svg width="16" height="16" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Microsoft
              </button>
            </div>

            <p className="mt-5 text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-navy hover:underline underline-offset-2">
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
