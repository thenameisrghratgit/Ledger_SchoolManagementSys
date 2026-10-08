import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyError } from '../lib/errors.js'
import SealMark from '../components/SealMark.jsx'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [done, setDone] = useState(false)
  const { updatePassword, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!password) next.password = 'Enter a new password.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (confirm !== password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setNotice('')
    try {
      const result = await updatePassword(password)
      if (result.ok) {
        setDone(true)
        setTimeout(() => navigate('/login', { replace: true }), 1800)
      } else {
        setNotice(friendlyError(result.error))
      }
    } catch {
      setNotice('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-navy via-navy-deep to-navy px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold-300">
          <SealMark size={34} animate={false} />
        </div>
        <p className="max-w-sm text-center text-sm text-gold-100/80">
          This reset link is invalid or has expired. Use “Forgot password?” on the
          sign-in page to request a new one.
        </p>
        <Link to="/login"
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-100">
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-deep to-navy px-4 py-10">
      <div className="w-full max-w-[380px] rounded-[20px] bg-white px-7 py-8 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-deep text-gold-300">
            <SealMark size={30} animate={true} />
          </div>
          <h1 className="font-serif text-xl font-bold text-text">Ledgerhall</h1>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 size={34} className="text-emerald-500" />
            <p className="text-[15px] font-semibold text-text">Password updated</p>
            <p className="text-sm text-text-secondary">Signing you in shortly…</p>
          </div>
        ) : (
          <>
            <h2 className="text-[1.2rem] font-bold text-text">Set a new password</h2>
            <p className="mt-1 text-sm text-text-secondary">Choose a strong password for your account</p>

            <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-3.5">
              <div>
                <label className="block text-sm font-semibold text-text mb-1.5">New password</label>
                <div className={`flex items-center gap-2.5 rounded-xl border px-3 h-[48px] transition-colors ${
                  errors.password ? 'border-rose-300' : 'border-[#ecedec] focus-within:border-navy'
                }`}>
                  <Lock size={17} className="flex-shrink-0 text-text-secondary" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 border-none bg-transparent text-[14px] text-text placeholder:text-text-secondary/50 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    className="flex-shrink-0 text-text-secondary hover:text-text transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-1.5">Confirm password</label>
                <div className={`flex items-center gap-2.5 rounded-xl border px-3 h-[48px] transition-colors ${
                  errors.confirm ? 'border-rose-300' : 'border-[#ecedec] focus-within:border-navy'
                }`}>
                  <Lock size={17} className="flex-shrink-0 text-text-secondary" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Repeat the password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="flex-1 border-none bg-transparent text-[14px] text-text placeholder:text-text-secondary/50 focus:outline-none"
                  />
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-rose-500">{errors.confirm}</p>}
              </div>

              {notice && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
                  {notice}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-navy h-[48px] text-[14px] font-semibold text-white shadow-md transition-all hover:bg-navy-deep hover:shadow-lg disabled:opacity-60">
                {loading ? 'Saving…' : 'Update Password'}
              </button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-sm text-text-secondary">
          <Link to="/login" className="font-semibold text-navy hover:underline underline-offset-2">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
