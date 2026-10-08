import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured, configError } from '../lib/supabase.js'
import { friendlyError } from '../lib/errors.js'

const AuthContext = createContext(null)

const PORTALS = { admin: '/admin', student: '/student', teacher: '/teacher', parent: '/parent' }

// A client-side signup may never request the admin role; the database
// trigger enforces the same rule, this keeps the metadata honest.
const CLIENT_ROLES = ['student', 'teacher', 'parent']

export function portalFor(role) {
  return PORTALS[role] || '/'
}

function authRedirectUrl(path = 'login') {
  const base = import.meta.env.BASE_URL || '/'
  return `${window.location.origin}${base}${path}`
}

async function buildUser(sbUser) {
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sbUser.id)
    .maybeSingle()
  if (pErr) return { user: null, error: friendlyError(pErr) }
  if (!profile) {
    return {
      user: null,
      error: friendlyError('Your account has no profile. Please contact your administrator.'),
    }
  }

  const user = {
    id: profile.id,
    email: sbUser.email,
    role: profile.role,
    name: profile.full_name || sbUser.email,
    phone: profile.phone || '',
    avatarUrl: profile.avatar_url || null,
    status: profile.status,
  }

  if (profile.role === 'student') {
    const { data: row, error } = await supabase
      .from('students')
      .select('*')
      .eq('auth_id', sbUser.id)
      .maybeSingle()
    if (error) return { user: null, error: friendlyError(error) }
    if (!row) {
      return {
        user: null,
        error: friendlyError('Your student record is missing. Please contact your administrator.'),
      }
    }
    user.studentId = row.student_id
    user.className = row.class_name
    user.section = row.section
    user.student = row
  } else if (profile.role === 'teacher') {
    const { data: row, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('auth_id', sbUser.id)
      .maybeSingle()
    if (error) return { user: null, error: friendlyError(error) }
    if (!row) {
      return {
        user: null,
        error: friendlyError('Your teacher record is missing. Please contact your administrator.'),
      }
    }
    user.teacherId = row.teacher_id
    user.teacher = row
  } else if (profile.role === 'parent') {
    const { data: links, error } = await supabase
      .from('parent_student')
      .select('student_id')
      .eq('parent_id', sbUser.id)
    if (error) return { user: null, error: friendlyError(error) }
    // no linked child is a valid state — the parent portal shows an explicit
    // "no linked student" screen instead of fabricated data
    user.childStudentId = links?.[0]?.student_id ?? null
  }

  return { user, error: null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isConfigured)
  const [error, setError] = useState(isConfigured ? null : configError)

  useEffect(() => {
    if (!isConfigured) return undefined
    let cancelled = false

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return
        if (session) {
          const { user: u, error: err } = await buildUser(session.user)
          if (err) {
            await supabase.auth.signOut()
            setError(err)
          } else {
            setUser(u)
          }
        }
        setLoading(false)
      })
      .catch((e) => {
        // never leave the app stuck on the loading screen after a refresh
        if (cancelled) return
        setError(friendlyError(e))
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer profile/row lookups: doing supabase DB calls inside the auth
      // callback can deadlock the persistence lock in supabase-js v2
      setTimeout(async () => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          return
        }
        const { user: u, error: err } = await buildUser(session.user)
        if (err) {
          // e.g. profile/record missing — sign out instead of rendering a
          // portal the account cannot use, and surface why on /login
          setUser(null)
          setError(err)
          await supabase.auth.signOut()
        } else {
          setError(null)
          setUser(u)
        }
      }, 0)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    if (!isConfigured) return { ok: false, error: configError }
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (err) {
      // friendlyError maps "Invalid login credentials" / "Email not
      // confirmed" / rate-limit and network errors to readable sentences
      return { ok: false, error: friendlyError(err) }
    }
    const { user: u, error: buildErr } = await buildUser(data.user)
    if (buildErr) {
      await supabase.auth.signOut()
      return { ok: false, error: buildErr }
    }
    setUser(u)
    setError(null)
    return { ok: true, role: u.role }
  }

  const register = async (email, password, meta = {}) => {
    if (!isConfigured) return { ok: false, error: configError }
    // never let a client request admin (or any unsupported) via user metadata
    const role = CLIENT_ROLES.includes(meta.role) ? meta.role : 'student'
    const safeMeta = { ...meta, role }
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: safeMeta },
    })
    if (err) return { ok: false, error: friendlyError(err) }

    if (data.session) {
      const { user: u, error: buildErr } = await buildUser(data.user)
      if (buildErr) {
        await supabase.auth.signOut()
        return { ok: false, error: buildErr }
      }
      setUser(u)
      return { ok: true, role: u.role }
    }
    // email confirmation is enabled: account + records are already created
    // by the database trigger; the user must verify before signing in
    return { ok: true, role, needsVerification: true }
  }

  const resetPassword = async (email) => {
    if (!isConfigured) return { ok: false, error: configError }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl('reset-password'),
    })
    if (err) return { ok: false, error: friendlyError(err) }
    return { ok: true }
  }

  const updatePassword = async (newPassword) => {
    if (!isConfigured) return { ok: false, error: configError }
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) return { ok: false, error: friendlyError(err) }
    return { ok: true }
  }

  const signInWithProvider = async (provider) => {
    if (!isConfigured) return { ok: false, error: configError }
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authRedirectUrl('login') },
    })
    if (err) return { ok: false, error: friendlyError(err) }
    return { ok: true }
  }

  const logout = async () => {
    if (isConfigured) await supabase.auth.signOut()
    setUser(null)
    setError(isConfigured ? null : configError)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        configured: isConfigured,
        login,
        logout,
        register,
        resetPassword,
        updatePassword,
        signInWithProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
