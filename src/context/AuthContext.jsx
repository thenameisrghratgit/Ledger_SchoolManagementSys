import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase.js'
import { getProfile, upsertProfile } from '../api/profiles.js'

const AuthContext = createContext(null)

// Demo credentials used when Supabase is not yet configured
const DEMO_USERS = [
  { email: 'admin@ghr',   password: 'admin1234',  role: 'admin',   name: 'Administrator',       meta: {} },
  { email: 'student@ghr', password: 'student123', role: 'student', name: 'Aarav Krishnan',       meta: { studentId: 'STU-2026-0142', className: 'Class 8', section: 'B' } },
  { email: 'teacher@ghr', password: 'teacher123', role: 'teacher', name: 'Dr. Priya Ramachandran', meta: { teacherId: 'TCH-001', department: 'Sciences' } },
  { email: 'parent@ghr',  password: 'parent123',  role: 'parent',  name: 'Suresh Krishnan',      meta: { childStudentId: 'STU-2026-0142', childName: 'Aarav Krishnan' } },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) {
      // Restore demo session from sessionStorage
      try {
        const raw = sessionStorage.getItem('sms_session')
        if (raw) setUser(JSON.parse(raw))
      } catch { /* ignore */ }
      setLoading(false)
      return
    }

    // Supabase: restore session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await loadSupabaseUser(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) await loadSupabaseUser(session.user)
      else setUser(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadSupabaseUser(sbUser) {
    const { data: profile } = await getProfile(sbUser.id)
    if (profile) {
      setUser({ id: sbUser.id, email: sbUser.email, ...profile })
    } else {
      setUser({ id: sbUser.id, email: sbUser.email, role: 'student', name: sbUser.email })
    }
  }

  const login = async (email, password) => {
    if (!isConfigured) {
      const demo = DEMO_USERS.find(
        (u) => u.email === email.trim().toLowerCase() && u.password === password
      )
      if (!demo) return { ok: false, error: 'Invalid email or password.' }
      const session = { email: demo.email, role: demo.role, name: demo.name, ...demo.meta }
      setUser(session)
      sessionStorage.setItem('sms_session', JSON.stringify(session))
      return { ok: true, role: demo.role }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    await loadSupabaseUser(data.user)
    // Return role for redirect
    const { data: profile } = await getProfile(data.user.id)
    return { ok: true, role: profile?.role || 'student' }
  }

  const register = async (email, password, role, profileData) => {
    if (!isConfigured) {
      const session = { email, role, ...profileData }
      setUser(session)
      sessionStorage.setItem('sms_session', JSON.stringify(session))
      return { ok: true, role }
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { ok: false, error: error.message }

    const profile = { id: data.user.id, email, role, ...profileData }
    await upsertProfile(profile)
    setUser(profile)
    return { ok: true, role }
  }

  const logout = async () => {
    if (isConfigured) await supabase.auth.signOut()
    sessionStorage.removeItem('sms_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
