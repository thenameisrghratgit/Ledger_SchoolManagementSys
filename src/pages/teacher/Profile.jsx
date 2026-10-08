import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTeacherById, updateOwnTeacher } from '../../api/teachers.js'
import { friendlyError } from '../../lib/errors.js'

function normalizeTeacher(t) {
  if (!t) return null
  return {
    teacherId: t.teacherId ?? t.teacher_id,
    authId: t.authId ?? t.auth_id,
    name: t.name,
    department: t.department,
    qualification: t.qualification,
    subjects: Array.isArray(t.subjects) ? t.subjects : [],
    contact: t.contact,
    email: t.email,
    experience: t.experience ? String(t.experience) : '',
    classes: t.classes,
    status: t.status,
  }
}

export default function TeacherProfile() {
  const { user } = useAuth()

  const [teacher, setTeacher] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', contact: '', department: '', experience: '', subjects: '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const tid = user?.teacherId
      if (!tid) { setError('Your teacher record is missing. Please contact your administrator.'); setLoading(false); return }
      let t = user?.teacher ? normalizeTeacher(user.teacher) : null
      if (!t) {
        const { data, error: err } = await getTeacherById(tid)
        if (cancelled) return
        if (err) { setError(friendlyError(err)); setLoading(false); return }
        t = data
      }
      if (cancelled) return
      if (!t) { setError('Teacher profile not found. Please contact your administrator.'); setLoading(false); return }
      setTeacher(t)
      setForm({
        name:       t.name,
        email:      t.email || user?.email || '',
        contact:    t.contact || '',
        department: t.department || '',
        experience: t.experience ? String(t.experience) : '',
        subjects:   (t.subjects || []).join(', '),
      })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user?.teacherId, user?.teacher])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false) }

  const Field = ({ label, k, type = 'text', readOnly = false }) => (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">{label}</label>
      <input type={type} value={form[k]} onChange={set(k)} readOnly={readOnly}
        className={`w-full rounded-xl border border-border px-3.5 py-2.5 text-[14px] text-text focus:border-navy focus:outline-none transition-colors ${readOnly ? 'bg-surface opacity-60 cursor-not-allowed' : 'bg-surface-card'}`} />
    </div>
  )

  const handleSave = async () => {
    if (!teacher || saving) return
    setError('')
    setSaved(false)
    setSaving(true)
    const { error: err } = await updateOwnTeacher({
      teacherId:    teacher.teacherId,
      name:         form.name,
      email:        form.email,
      contact:      form.contact,
      experience:   form.experience,
      department:   teacher.department,
      qualification: teacher.qualification,
      subjects:     teacher.subjects,
      classes:      teacher.classes,
    })
    setSaving(false)
    if (err) { setError(friendlyError(err)); setSaved(false); return }
    setSaved(true)
    setTeacher((prev) => ({ ...prev, name: form.name, email: form.email, contact: form.contact, experience: form.experience }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">My Profile</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">View and update your personal information</p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        </div>
      ) : teacher ? (
        <>
          {/* Avatar card */}
          <div className="flex items-center gap-5 rounded-xl border border-border bg-surface-card p-5 shadow-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-[24px] font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #C4622D, #a04d24)' }}>
              {teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-[17px] font-bold text-text">{teacher.name}</p>
              <p className="text-[13.5px] text-text-secondary">{teacher.department} · {teacher.teacherId}</p>
              <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${
                teacher.status === 'Active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>{teacher.status}</span>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border bg-surface-card p-6 shadow-card">
            <p className="mb-5 text-[15px] font-semibold text-text">Personal Information</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name"    k="name" />
              <Field label="Email"        k="email" type="email" />
              <Field label="Phone"        k="contact" />
              <Field label="Department"   k="department" readOnly />
              <Field label="Experience (years)" k="experience" />
              <Field label="Subjects Taught"    k="subjects" readOnly />
            </div>

            <div className="mt-6 flex items-center justify-between">
              {saved ? (
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                  <Check size={14} /> Changes saved
                </span>
              ) : <span />}
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-sm disabled:opacity-60"
                style={{ background: '#C4622D' }}>
                Save Changes
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
            <p className="mb-4 text-[15px] font-semibold text-text">Account</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">Teacher ID</label>
                <p className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text opacity-70">{teacher.teacherId}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">Role</label>
                <p className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text opacity-70">Teacher</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}