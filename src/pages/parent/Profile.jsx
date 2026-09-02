import { useState } from 'react'
import { Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_STUDENTS } from '../../data/students.js'

export default function ParentProfile() {
  const { user } = useAuth()
  const childId = user?.childStudentId || 'STU-2026-0142'
  const child   = SEED_STUDENTS.find((s) => s.studentId === childId) || SEED_STUDENTS[0]

  const [form, setForm] = useState({
    name:    user?.name || child.parentName,
    email:   user?.email || 'parent@school.edu',
    contact: child.contact,
    address: child.address,
  })
  const [saved, setSaved] = useState(false)

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false) }

  const Field = ({ label, k, type = 'text' }) => (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">{label}</label>
      <input type={type} value={form[k]} onChange={set(k)}
        className="w-full rounded-xl border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:border-violet-500 focus:outline-none transition-colors" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">My Profile</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Your contact information linked to {child.name}</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 rounded-xl border border-border bg-surface-card p-5 shadow-card">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-[24px] font-bold text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5b21b6)' }}>
          {(user?.name || child.parentName).split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <p className="text-[17px] font-bold text-text">{user?.name || child.parentName}</p>
          <p className="text-[13.5px] text-text-secondary">Parent / Guardian</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface-card p-6 shadow-card">
        <p className="mb-5 text-[15px] font-semibold text-text">Contact Information</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name"    k="name" />
          <Field label="Email"        k="email" type="email" />
          <Field label="Phone"        k="contact" />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">Address</label>
            <input value={form.address} onChange={set('address')}
              className="w-full rounded-xl border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:border-violet-500 focus:outline-none transition-colors" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          {saved ? (
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600"><Check size={14} /> Saved</span>
          ) : <span />}
          <button onClick={() => setSaved(true)}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-sm"
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
            <p className="text-[12.5px] text-text-secondary">{child.className} · Section {child.section} · {child.studentId}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
