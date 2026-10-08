import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getStudentById } from '../../api/students.js'
import { updateProfile } from '../../api/profiles.js'
import { friendlyError } from '../../lib/errors.js'

export default function ParentProfile() {
  const { user } = useAuth()
  const childId = user?.childStudentId

  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(!!childId)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '—', contact: '', address: '' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    let cancelled = false
    getStudentById(childId).then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError(friendlyError(err))
      else if (!data) setError('Linked student record not found. Please contact the school office.')
      else setChild(data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [childId])

  useEffect(() => {
    if (!child) return
    setForm({
      name:    user?.name || child.parentName || '',
      email:   user?.email || '—',
      contact: child.contact || '',
      address: child.address || '',
    })
  }, [child, user])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); setSaveError('') }

  const handleSave = async () => {
    if (saving) return
    setSaveError('')
    setSaved(false)
    setSaving(true)
    const { error: err } = await updateProfile({
      id: user.id,
      fullName: form.name,
      phone: form.contact,
      avatarUrl: user?.avatarUrl || null,
    })
    setSaving(false)
    if (err) { setSaveError(friendlyError(err)); return }
    setSaved(true)
  }

  const Field = ({ label, k, type = 'text', readOnly = false }) => (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">{label}</label>
      <input type={type} value={form[k]} onChange={set(k)} readOnly={readOnly}
        className={`w-full rounded-xl border border-border px-3.5 py-2.5 text-[14px] text-text focus:border-violet-500 focus:outline-none transition-colors ${readOnly ? 'bg-surface opacity-60 cursor-not-allowed' : 'bg-surface-card'}`} />
    </div>
  )

  return (
    <div className="space-y-6">
      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        </div>
      ) : !childId ? (
        <NoLinkedChild />
      ) : child ? (
        <>
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-text">My Profile</h2>
            <p className="mt-1 text-[14.5px] text-text-secondary">Your contact information linked to {child.name}</p>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 rounded-xl border border-border bg-surface-card p-5 shadow-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-[24px] font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5b21b6)' }}>
              {(user?.name || child.parentName || '').split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-[17px] font-bold text-text">{user?.name || child.parentName || 'Parent'}</p>
              <p className="text-[13.5px] text-text-secondary">Parent / Guardian</p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border bg-surface-card p-6 shadow-card">
            <p className="mb-5 text-[15px] font-semibold text-text">Contact Information</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name"    k="name" />
              <Field label="Email"        k="email" type="email" readOnly />
              <Field label="Phone"        k="contact" />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">Address</label>
                <input value={form.address} onChange={set('address')} readOnly
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              {saveError ? (
                <p className="flex items-start gap-2 text-[13px] text-rose-600">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  {saveError}
                </p>
              ) : saved ? (
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600"><Check size={14} /> Saved</span>
              ) : <span />}
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: '#7C3AED' }}>
                Save Changes
              </button>
            </div>
          </div>

          {/* Linked child */}
          <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
            <p className="mb-4 text-[15px] font-semibold text-text">Linked Child</p>
            <div className="flex items-center gap-4 rounded-xl bg-surface px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-[14px] font-bold text-violet-800">
                {child.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text">{child.name}</p>
                <p className="text-[12.5px] text-text-secondary">{child.className} · Section {child.section || '—'} · {child.studentId}</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function NoLinkedChild() {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
      <p className="text-[15px] font-semibold text-text">No linked student account</p>
      <p className="mt-1 text-[14px] text-text-secondary">
        This parent login is not linked to a student yet. Check the Student ID you registered with, or contact the school office.
      </p>
    </div>
  )
}
