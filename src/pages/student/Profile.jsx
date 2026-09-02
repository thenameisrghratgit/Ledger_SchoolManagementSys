import { useState } from 'react'
import { Save, CheckCircle2, UserCircle, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_STUDENTS } from '../../data/students.js'

const inp = 'w-full rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:outline-none focus:border-blue-500 transition-colors'

export default function StudentProfile() {
  const { user } = useAuth()
  const studentId = user?.studentId || 'STU-2026-0142'
  const seed = SEED_STUDENTS.find((s) => s.studentId === studentId) || SEED_STUDENTS[0]

  const [form, setForm] = useState({ ...seed, email: user?.email || 'aarav.k@student.ledgerhall.in' })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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
        </div>
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {saved ? (
            <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-600">
              <CheckCircle2 size={15} /> Changes saved
            </span>
          ) : <span />}
          <button onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
