import { useEffect, useState } from 'react'
import { Save, CheckCircle2, UserCircle, Mail, Phone, MapPin, Calendar, Users, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getStudentById, updateOwnStudent } from '../../api/students.js'
import { friendlyError } from '../../lib/errors.js'

const inp = 'w-full rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:outline-none focus:border-blue-500 transition-colors'

export default function StudentProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const studentId = user?.studentId
  const authEmail = user?.email

  useEffect(() => {
    if (!studentId) {
      setError('Your student record is missing. Please contact your administrator.')
      setLoading(false)
      return undefined
    }
    let cancelled = false
    getStudentById(studentId).then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError(friendlyError(err))
      else if (!data) setError('Your student record is missing. Please contact your administrator.')
      else setForm({
        ...data,
        name: data.name || '',
        email: authEmail || data.email || '',
        dob: data.dob || '',
        gender: data.gender || '',
        className: data.className || '',
        section: data.section || '',
        parentName: data.parentName || '',
        contact: data.contact || '',
        address: data.address || '',
      })
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [studentId, authEmail])

  const set = (k) => (e) => {
    setSaved(false)
    setSaveError('')
    setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  const handleSave = async () => {
    if (!form || saving) return
    setSaved(false)
    setSaveError('')
    setSaving(true)
    const { error: err } = await updateOwnStudent(form)
    setSaving(false)
    if (err) {
      setSaveError(friendlyError(err))
      return
    }
    setSaved(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-14">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    )
  }

  if (!form) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        {error || 'Your student record is missing. Please contact your administrator.'}
      </p>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">My Profile</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Your personal information and academic details</p>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-5 rounded-xl border border-border bg-surface-card p-5 shadow-card">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <UserCircle size={36} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[18px] font-semibold text-text">{form.name}</p>
          <p className="text-[13.5px] text-text-secondary">{form.studentId} · {form.className} – Section {form.section}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface-card shadow-card">
        <div className="border-b border-border px-6 py-4">
          <p className="text-[15px] font-semibold text-text">Personal Details</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-text">Full Name</label>
              <input value={form.name} onChange={set('name')} className={inp} />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-text">Student ID</label>
              <input value={form.studentId} disabled className={inp + ' opacity-50'} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-text">Date of Birth</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
                <Calendar size={15} className="shrink-0 text-text-secondary" />
                <input type="date" value={form.dob} onChange={set('dob')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-text">Gender</label>
              <select value={form.gender} onChange={set('gender')} className={inp}>
                {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
              <Mail size={15} className="shrink-0 text-text-secondary" />
              <input type="email" value={form.email} onChange={set('email')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-text">Contact</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
                <Phone size={15} className="shrink-0 text-text-secondary" />
                <input value={form.contact} onChange={set('contact')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-text">Parent / Guardian</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
                <Users size={15} className="shrink-0 text-text-secondary" />
                <input value={form.parentName} onChange={set('parentName')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text">Address</label>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
              <MapPin size={15} className="shrink-0 text-text-secondary mt-0.5" />
              <textarea value={form.address} onChange={set('address')} rows={2} className="flex-1 resize-none border-none bg-transparent text-[14px] text-text focus:outline-none" />
            </div>
          </div>
          {saveError && (
            <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {saveError}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {saved ? (
            <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-600">
              <CheckCircle2 size={15} /> Changes saved
            </span>
          ) : <span />}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
