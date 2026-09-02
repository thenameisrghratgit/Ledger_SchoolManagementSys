import { useState } from 'react'
import { Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_TEACHERS } from '../../data/teachers.js'

export default function TeacherProfile() {
  const { user } = useAuth()
  const seed = SEED_TEACHERS.find((t) => t.teacherId === (user?.teacherId || 'TCH-001')) || SEED_TEACHERS[0]

  const [form, setForm] = useState({
    name:       seed.name,
    email:      seed.email || user?.email || 'teacher@school.edu',
    contact:    seed.contact,
    department: seed.department,
    experience: String(seed.experience),
    subjects:   seed.subjects.join(', '),
  })
  const [saved, setSaved] = useState(false)

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false) }

  const Field = ({ label, k, type = 'text', readOnly = false }) => (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">{label}</label>
      <input type={type} value={form[k]} onChange={set(k)} readOnly={readOnly}
        className={`w-full rounded-xl border border-border px-3.5 py-2.5 text-[14px] text-text focus:border-navy focus:outline-none transition-colors ${readOnly ? 'bg-surface opacity-60 cursor-not-allowed' : 'bg-surface-card'}`} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">My Profile</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">View and update your personal information</p>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-5 rounded-xl border border-border bg-surface-card p-5 shadow-card">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-[24px] font-bold text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #C4622D, #a04d24)' }}>
          {seed.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <p className="text-[17px] font-bold text-text">{seed.name}</p>
          <p className="text-[13.5px] text-text-secondary">{seed.department} · {seed.teacherId}</p>
          <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${
            seed.status === 'Active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}>{seed.status}</span>
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
          <button onClick={() => setSaved(true)}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-sm"
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
            <p className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text opacity-70">{seed.teacherId}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">Role</label>
            <p className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text opacity-70">Teacher</p>
          </div>
        </div>
      </div>
    </div>
  )
}
