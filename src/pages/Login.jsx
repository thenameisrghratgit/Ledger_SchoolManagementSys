import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import TextInput from '../components/ui/TextInput.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import SchoolLogo from '../components/SchoolLogo.jsx'
import AuthIllustration from '../components/AuthIllustration.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
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

  const handleSubmit = (e) => {
    e.preventDefault()
    setNotice('')
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const result = login(form.email, form.password)
      if (result.ok) {
        const redirectTo = location.state?.from || '/admin'
        navigate(redirectTo, { replace: true })
      } else {
        setNotice(result.error)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile / tablet top bar */}
      <div className="flex items-center gap-2.5 border-b border-border bg-surface-card px-5 py-4 lg:hidden">
        <SchoolLogo size={28} />
        <span className="text-sm font-semibold text-text">Ledgerhall</span>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-57px)] max-w-[1080px] grid-cols-1 lg:min-h-screen lg:max-w-none lg:grid-cols-2">
        <AuthIllustration />

        <div className="flex items-center justify-center bg-surface-card px-6 py-12 sm:px-10 lg:min-h-screen lg:px-14 lg:py-16">
          <div className="w-full max-w-[380px]">
            <h1 className="text-2xl font-semibold tracking-tight text-text">Sign in</h1>
            <p className="mt-2 text-[15px] text-text-secondary">
              Welcome back. Enter your credentials to continue.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <TextInput
                label="Email address"
                icon={Mail}
                type="email"
                placeholder="Enter your email"
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
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={update('remember')}
                    className="focus-ring h-4 w-4 rounded border-border text-navy accent-navy"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setNotice('Password reset is not wired up in this UI demo.')}
                  className="focus-ring rounded text-sm font-medium text-navy hover:text-navy-deep hover:underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              {notice && (
                <p
                  className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                    notice === 'Invalid email or password'
                      ? 'border-rose-200 bg-rose-50 text-rose-600'
                      : 'border-border bg-surface text-text-secondary'
                  }`}
                >
                  {notice}
                </p>
              )}

              <Button type="submit" loading={loading} className="mt-1">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-8 text-center text-[15px] text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="focus-ring rounded font-semibold text-navy hover:text-navy-deep hover:underline underline-offset-2"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}