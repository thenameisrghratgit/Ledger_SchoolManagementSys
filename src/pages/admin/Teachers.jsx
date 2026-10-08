import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
  GraduationCap, BookOpen, CalendarCheck, UserX, X, Mail, Phone, AlertCircle,
} from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { DEPARTMENT_OPTIONS, emptyTeacher } from '../../data/teachers.js'
import { getTeachers, upsertTeacher, deleteTeacher } from '../../api/teachers.js'
import { friendlyError } from '../../lib/errors.js'

const PAGE_SIZE = 6

const STATUS_PILL = {
  Active:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  'On Leave': 'bg-amber-50 text-amber-700 border-amber-100',
  Inactive:  'bg-slate-50 text-slate-600 border-slate-200',
}

function nextTeacherId(list) {
  const max = list.reduce((m, t) => {
    const n = parseInt(String(t.teacherId).replace(/^TCH-/, ''), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `TCH-${String(max + 1).padStart(3, '0')}`
}

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // { mode: 'add'|'view'|'edit', teacher }
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    let cancelled = false
    getTeachers().then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError(friendlyError(err))
      else setTeachers(data || [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    document.body.style.overflow = modal || deleteTarget ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal, deleteTarget])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return teachers.filter((t) => {
      const matchQ = !q || t.teacherId.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
      const matchD = !deptFilter || t.department === deptFilter
      return matchQ && matchD
    })
  }, [teachers, search, deptFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safe = Math.min(page, totalPages)
  const rows = filtered.slice((safe - 1) * PAGE_SIZE, safe * PAGE_SIZE)

  const reset = () => setPage(1)

  const handleSave = async (form) => {
    setActionError('')
    const subjects = typeof form.subjects === 'string'
      ? form.subjects.split(',').map((s) => s.trim()).filter(Boolean)
      : form.subjects || []
    const payload = { ...form, teacherId: form.teacherId || nextTeacherId(teachers), subjects }
    const { data, error: err } = await upsertTeacher(payload)
    if (err) return friendlyError(err)
    setTeachers((prev) => {
      const exists = prev.some((t) => t.teacherId === data.teacherId)
      return exists ? prev.map((t) => t.teacherId === data.teacherId ? data : t) : [data, ...prev]
    })
    setModal(null)
    return null
  }

  const handleDelete = async () => {
    setActionError('')
    const target = deleteTarget
    setDeleteTarget(null)
    const { error: err } = await deleteTeacher(target.teacherId)
    if (err) {
      setActionError(friendlyError(err))
      return
    }
    setTeachers((prev) => prev.filter((t) => t.teacherId !== target.teacherId))
  }

  const onLeaveCount  = teachers.filter((t) => t.status === 'On Leave').length
  const activeCount   = teachers.filter((t) => t.status === 'Active').length
  const subjectSet    = new Set(teachers.flatMap((t) => t.subjects))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-text">Teacher Management</h2>
          <p className="mt-1 text-[14.5px] text-text-secondary">Manage faculty profiles, subjects, and class allocations</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add', teacher: emptyTeacher() })}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-colors hover:bg-navy-deep self-start sm:self-auto"
        >
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      {(actionError || error) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {actionError || error}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Teachers"  value={teachers.length}  sub="Across all departments" icon={GraduationCap} tone="navy" />
        <StatCard label="Active Today"    value={activeCount}      sub={`${onLeaveCount} on leave`} icon={CalendarCheck} tone="emerald" />
        <StatCard label="On Leave"        value={onLeaveCount}     sub="Need substitutes"       icon={UserX}         tone="rose" />
        <StatCard label="Subjects Covered" value={subjectSet.size} sub="Across all grades"      icon={BookOpen}      tone="gold" />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-surface-card p-4 shadow-card sm:p-5">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); reset() }}
              placeholder="Search by ID or name"
              className="focus-ring w-full rounded-lg border border-border bg-surface-card py-2.5 pl-10 pr-3.5 text-[14px] text-text placeholder:text-text-secondary transition-colors hover:border-[#C6D0DB] focus:border-navy"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); reset() }}
            className="focus-ring rounded-lg border border-border bg-surface-card py-2.5 px-3.5 text-[14px] text-text transition-colors hover:border-[#C6D0DB] focus:border-navy sm:w-56"
          >
            <option value="">All Departments</option>
            {DEPARTMENT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
          </select>
          {(search || deptFilter) && (
            <button onClick={() => { setSearch(''); setDeptFilter(''); reset() }}
              className="shrink-0 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-navy hover:underline">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            </div>
          ) : (
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Name', 'Department', 'Subjects', 'Classes', 'Contact', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[14px] text-text-secondary">
                    No teachers match your search.
                  </td>
                </tr>
              )}
              {rows.map((t) => (
                <tr key={t.teacherId} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-3 py-3.5 text-[13px] font-medium text-text">{t.teacherId}</td>
                  <td className="px-3 py-3.5">
                    <p className="text-[14px] font-medium text-text">{t.name}</p>
                    <p className="text-[12px] text-text-secondary">{t.experience}</p>
                  </td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{t.department}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {t.subjects.map((s) => (
                        <span key={s} className="rounded-md bg-navy/[0.06] px-2 py-0.5 text-[11.5px] font-medium text-navy">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{t.classes}</td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{t.contact}</td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_PILL[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1">
                      <Btn label="View"   onClick={() => setModal({ mode: 'view', teacher: t })}><Eye size={14} /></Btn>
                      <Btn label="Edit"   onClick={() => setModal({ mode: 'edit', teacher: { ...t } })}><Pencil size={14} /></Btn>
                      <Btn label="Delete" tone="rose" onClick={() => setDeleteTarget(t)}><Trash2 size={14} /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
          <p className="text-[13px] text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (safe - 1) * PAGE_SIZE + 1}–{Math.min(safe * PAGE_SIZE, filtered.length)} of {filtered.length} teachers
          </p>
          <div className="flex items-center gap-2">
            <PgBtn disabled={safe === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={15} /></PgBtn>
            <span className="px-2 text-[13.5px] font-medium text-text">Page {safe} of {totalPages}</span>
            <PgBtn disabled={safe === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={15} /></PgBtn>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <TeacherModal
          mode={modal.mode}
          teacher={modal.teacher}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onEdit={() => setModal({ mode: 'edit', teacher: { ...modal.teacher } })}
        />
      )}

      {/* Confirm delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-6 shadow-xl">
            <h3 className="text-[16px] font-semibold text-text">Remove teacher?</h3>
            <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">
              This will permanently remove <span className="font-medium text-text">{deleteTarget.name}</span> ({deleteTarget.teacherId}) from the faculty records.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-[13.5px] font-medium text-text hover:bg-surface">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-rose-700">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Btn({ label, tone = 'navy', onClick, children }) {
  const base = tone === 'rose'
    ? 'hover:bg-rose-50 hover:text-rose-500'
    : 'hover:bg-navy/[0.07] hover:text-navy'
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className={`focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors ${base}`}>
      {children}
    </button>
  )
}

function PgBtn({ disabled, onClick, children }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-[#C6D0DB] hover:text-text disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  )
}

function TeacherModal({ mode, teacher, onClose, onSave, onEdit }) {
  const [form, setForm] = useState({ ...teacher })
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const isView = mode === 'view'
  const title = mode === 'add' ? 'Add Teacher' : mode === 'edit' ? 'Edit Teacher' : 'Teacher Details'

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!(form.name || '').trim()) e.name = 'Name is required.'
    if (!form.department)  e.department = 'Select a department.'
    if (!(form.contact || '').trim()) e.contact = 'Contact is required.'
    if (!(form.email || '').trim()) e.email = 'Email is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaveError('')
    const err = await onSave({ ...form, subjects: form.subjects || [] })
    if (err) setSaveError(err)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface-card shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[16px] font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="focus-ring rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isView ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy/[0.07] text-navy">
                  <GraduationCap size={26} strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-[17px] font-semibold text-text">{teacher.name}</p>
                  <p className="text-[13px] text-text-secondary">{teacher.teacherId} · {teacher.department}</p>
                </div>
                <span className={`ml-auto inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_PILL[teacher.status]}`}>
                  {teacher.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-surface p-4">
                {[
                  ['Experience', teacher.experience],
                  ['Classes', teacher.classes],
                  ['Subjects', (teacher.subjects || []).join(', ')],
                  ['Department', teacher.department],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
                    <p className="mt-0.5 text-[13.5px] text-text">{value || '—'}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5 rounded-xl bg-surface p-4">
                <div className="flex items-center gap-2.5 text-[13.5px] text-text">
                  <Mail size={15} className="text-text-secondary" /> {teacher.email}
                </div>
                <div className="flex items-center gap-2.5 text-[13.5px] text-text">
                  <Phone size={15} className="text-text-secondary" /> {teacher.contact}
                </div>
              </div>
            </div>
          ) : (
            <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full Name" error={errors.name}>
                <input value={form.name || ''} onChange={set('name')} placeholder="e.g. Dr. Priya Ramachandran"
                  className={input(errors.name)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Teacher ID">
                  <input value={form.teacherId || ''} onChange={set('teacherId')} placeholder="Auto-assigned"
                    disabled={mode === 'edit'} className={input(false) + (mode === 'edit' ? ' opacity-50' : '')} />
                </Field>
                <Field label="Department" error={errors.department}>
                  <select value={form.department || ''} onChange={set('department')} className={input(errors.department)}>
                    <option value="">Select…</option>
                    {DEPARTMENT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Experience">
                  <input value={form.experience || ''} onChange={set('experience')} placeholder="e.g. 8 yrs" className={input(false)} />
                </Field>
                <Field label="Classes Assigned">
                  <input value={form.classes || ''} onChange={set('classes')} placeholder="e.g. Grade 9–12" className={input(false)} />
                </Field>
              </div>
              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email || ''} onChange={set('email')} placeholder="teacher@ledgerhall.in" className={input(errors.email)} />
              </Field>
              <Field label="Contact" error={errors.contact}>
                <input value={form.contact || ''} onChange={set('contact')} placeholder="+91 XXXXX XXXXX" className={input(errors.contact)} />
              </Field>
              <Field label="Status">
                <select value={form.status || ''} onChange={set('status')} className={input(false)}>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Inactive</option>
                </select>
              </Field>
            </form>
          )}
          {saveError && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-4">
          {isView ? (
            <>
              <button onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-[13.5px] font-medium text-text hover:bg-surface">
                Close
              </button>
              <button onClick={onEdit}
                className="rounded-xl bg-navy px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-deep">
                Edit
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-[13.5px] font-medium text-text hover:bg-surface">
                Cancel
              </button>
              <button type="submit" form="teacher-form"
                className="rounded-xl bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-deep">
                {mode === 'add' ? 'Add Teacher' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-text">{label}</label>
      {children}
      {error && <p className="mt-1 text-[12px] text-rose-500">{error}</p>}
    </div>
  )
}

const input = (hasError) =>
  `w-full rounded-lg border ${hasError ? 'border-rose-300' : 'border-border'} bg-surface-card px-3.5 py-2.5 text-[14px] text-text placeholder:text-text-secondary focus:outline-none focus:border-navy transition-colors`
