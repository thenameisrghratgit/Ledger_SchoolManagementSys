import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Search, Eye, Pencil, Trash2, X,
  FileText, CalendarDays, CheckCircle2, Clock4, AlertCircle,
} from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { EXAM_TYPES, SUBJECTS_ALL } from '../../data/examinations.js'
import { CLASS_OPTIONS } from '../../data/students.js'
import { getExams, upsertExam, deleteExam } from '../../api/examinations.js'
import { friendlyError } from '../../lib/errors.js'

const STATUS_STYLE = {
  Upcoming:  { pill: 'bg-blue-50 text-blue-700 border-blue-200',      dot: '#3b82f6' },
  Completed: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#10b981' },
  Ongoing:   { pill: 'bg-amber-50 text-amber-700 border-amber-200',   dot: '#f59e0b' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function emptyExam() {
  return {
    id: '', name: '', type: 'Unit Test', subject: '', className: '',
    date: '', time: '', duration: '', room: '', maxMarks: '', status: 'Upcoming',
  }
}

function nextExamId(list) {
  const max = list.reduce((m, e) => {
    const n = parseInt(String(e.id).replace(/^EX-/, ''), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `EX-${String(max + 1).padStart(3, '0')}`
}

export default function Examinations() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    let cancelled = false
    getExams().then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError(friendlyError(err))
      else setExams(data || [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return exams.filter((e) => {
      const matchQ = !q || (e.name || '').toLowerCase().includes(q) || (e.subject || '').toLowerCase().includes(q) || (e.className || '').toLowerCase().includes(q)
      const matchS = !statusFilter || e.status === statusFilter
      return matchQ && matchS
    })
  }, [exams, search, statusFilter])

  const handleSave = async (form) => {
    setActionError('')
    const payload = {
      ...form,
      id: form.id || nextExamId(exams),
      maxMarks: Number(form.maxMarks) || 100,
    }
    const { data, error: err } = await upsertExam(payload)
    if (err) return friendlyError(err)
    setExams((prev) => {
      const exists = prev.some((e) => e.id === data.id)
      return exists ? prev.map((e) => e.id === data.id ? data : e) : [data, ...prev]
    })
    setModal(null)
    return null
  }

  const handleDelete = async () => {
    setActionError('')
    const target = deleteTarget
    setDeleteTarget(null)
    const { error: err } = await deleteExam(target.id)
    if (err) {
      setActionError(friendlyError(err))
      return
    }
    setExams((prev) => prev.filter((e) => e.id !== target.id))
  }

  const upcoming  = exams.filter((e) => e.status === 'Upcoming').length
  const completed = exams.filter((e) => e.status === 'Completed').length
  const ongoing   = exams.filter((e) => e.status === 'Ongoing').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-text">Examinations</h2>
          <p className="mt-1 text-[14.5px] text-text-secondary">Schedule exams, manage timetables, and track results</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add', exam: emptyExam() })}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm hover:bg-navy-deep transition-colors self-start sm:self-auto"
        >
          <Plus size={16} /> Schedule Exam
        </button>
      </div>

      {(actionError || error) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {actionError || error}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Exams"  value={exams.length}  sub="All time"              icon={FileText}    tone="navy" />
        <StatCard label="Upcoming"     value={upcoming}      sub="Scheduled ahead"       icon={CalendarDays} tone="gold" />
        <StatCard label="Ongoing"      value={ongoing}       sub="In progress today"     icon={Clock4}      tone="rose" />
        <StatCard label="Completed"    value={completed}     sub="Results available"     icon={CheckCircle2} tone="emerald" />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-surface-card p-4 shadow-card sm:p-5">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exam name, subject, or class"
              className="focus-ring w-full rounded-lg border border-border bg-surface-card py-2.5 pl-10 pr-3.5 text-[14px] text-text placeholder:text-text-secondary transition-colors hover:border-[#C6D0DB] focus:border-navy"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="focus-ring rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:border-navy sm:w-44">
            <option value="">All Status</option>
            <option>Upcoming</option>
            <option>Ongoing</option>
            <option>Completed</option>
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter('') }}
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
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {['Exam Name', 'Type', 'Class', 'Subject', 'Date & Time', 'Duration', 'Room', 'Max Marks', 'Status', ''].map((h) => (
                  <th key={h} className="px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-[14px] text-text-secondary">
                    No exams match your search.
                  </td>
                </tr>
              )}
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-3 py-3.5">
                    <p className="text-[13.5px] font-medium text-text">{e.name}</p>
                    <p className="text-[12px] text-text-secondary">{e.id}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="rounded-md bg-navy/[0.06] px-2 py-0.5 text-[11.5px] font-medium text-navy">{e.type}</span>
                  </td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{e.className}</td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text">{e.subject}</td>
                  <td className="px-3 py-3.5">
                    <p className="text-[13.5px] text-text">{fmtDate(e.date)}</p>
                    <p className="text-[12px] text-text-secondary">{e.time}</p>
                  </td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{e.duration}</td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{e.room}</td>
                  <td className="px-3 py-3.5 text-[13.5px] font-medium text-text text-center">{e.maxMarks || '—'}</td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[e.status]?.pill || ''}`}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_STYLE[e.status]?.dot }} />
                      {e.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1">
                      <EBtn label="View"   onClick={() => setModal({ mode: 'view', exam: e })}><Eye size={14} /></EBtn>
                      <EBtn label="Edit"   onClick={() => setModal({ mode: 'edit', exam: { ...e } })}><Pencil size={14} /></EBtn>
                      <EBtn label="Delete" tone="rose" onClick={() => setDeleteTarget(e)}><Trash2 size={14} /></EBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[13px] text-text-secondary">{filtered.length} exam{filtered.length !== 1 ? 's' : ''} shown</p>
        </div>
      </div>

      {/* Upcoming exams quick view */}
      {upcoming > 0 && (
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-[15px] font-semibold text-text">Upcoming Schedule</h3>
          <div className="space-y-2.5">
            {exams
              .filter((e) => e.status === 'Upcoming' && e.date)
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
              .map((e) => (
                <div key={e.id} className="flex items-center gap-4 rounded-lg bg-surface px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-navy/[0.07] text-navy">
                    <span className="text-[13px] font-bold leading-none">{new Date(e.date + 'T00:00:00').getDate()}</span>
                    <span className="text-[10px] font-medium leading-tight">{new Date(e.date + 'T00:00:00').toLocaleString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-text">{e.subject} — {e.name}</p>
                    <p className="text-[12px] text-text-secondary">{e.className} · {e.time} · {e.room}</p>
                  </div>
                  <span className="shrink-0 text-[12px] font-medium text-text-secondary">{e.duration}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <ExamModal
          mode={modal.mode}
          exam={modal.exam}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onEdit={() => setModal({ mode: 'edit', exam: { ...modal.exam } })}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-6 shadow-xl">
            <h3 className="text-[16px] font-semibold text-text">Delete exam?</h3>
            <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">
              This will permanently remove the <span className="font-medium text-text">{deleteTarget.subject}</span> exam
              scheduled for <span className="font-medium text-text">{fmtDate(deleteTarget.date)}</span>.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-[13.5px] font-medium text-text hover:bg-surface">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-rose-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EBtn({ label, tone = 'navy', onClick, children }) {
  const base = tone === 'rose' ? 'hover:bg-rose-50 hover:text-rose-500' : 'hover:bg-navy/[0.07] hover:text-navy'
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className={`focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors ${base}`}>
      {children}
    </button>
  )
}

function ExamModal({ mode, exam, onClose, onSave, onEdit }) {
  const [form, setForm] = useState({ ...exam })
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const isView = mode === 'view'
  const title = mode === 'add' ? 'Schedule Exam' : mode === 'edit' ? 'Edit Exam' : 'Exam Details'

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.subject) e.subject = 'Subject is required.'
    if (!form.className) e.className = 'Class is required.'
    if (!form.date) e.date = 'Date is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaveError('')
    const err = await onSave({ ...form })
    if (err) setSaveError(err)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface-card shadow-xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[16px] font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="focus-ring rounded-lg p-1.5 text-text-secondary hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isView ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-[17px] font-semibold text-text">{exam.name}</p>
                <p className="mt-0.5 text-[13px] text-text-secondary">{exam.id} · {exam.type}</p>
                <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[exam.status]?.pill || ''}`}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_STYLE[exam.status]?.dot }} />
                  {exam.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-surface p-4">
                {[
                  ['Subject', exam.subject],
                  ['Class', exam.className],
                  ['Date', fmtDate(exam.date)],
                  ['Time', exam.time],
                  ['Duration', exam.duration],
                  ['Room / Venue', exam.room],
                  ['Max Marks', exam.maxMarks],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
                    <p className="mt-0.5 text-[13.5px] text-text">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form id="exam-form" onSubmit={handleSubmit} className="space-y-4">
              <Field label="Exam Name">
                <input value={form.name} onChange={set('name')} placeholder="e.g. Mid-term Examination"
                  className={inp(false)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <select value={form.type} onChange={set('type')} className={inp(false)}>
                    {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={set('status')} className={inp(false)}>
                    <option>Upcoming</option><option>Ongoing</option><option>Completed</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Subject" error={errors.subject}>
                  <select value={form.subject} onChange={set('subject')} className={inp(errors.subject)}>
                    <option value="">Select…</option>
                    {SUBJECTS_ALL.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Class" error={errors.className}>
                  <select value={form.className} onChange={set('className')} className={inp(errors.className)}>
                    <option value="">Select…</option>
                    {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" error={errors.date}>
                  <input type="date" value={form.date} onChange={set('date')} className={inp(errors.date)} />
                </Field>
                <Field label="Time">
                  <input type="time" value={form.time} onChange={set('time')} className={inp(false)} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Duration">
                  <input value={form.duration} onChange={set('duration')} placeholder="e.g. 3h" className={inp(false)} />
                </Field>
                <Field label="Room / Venue">
                  <input value={form.room} onChange={set('room')} placeholder="e.g. Hall A" className={inp(false)} />
                </Field>
                <Field label="Max Marks">
                  <input type="number" value={form.maxMarks} onChange={set('maxMarks')} placeholder="100" className={inp(false)} />
                </Field>
              </div>
            </form>
          )}
          {saveError && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {saveError}
            </p>
          )}
        </div>

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
              <button type="submit" form="exam-form"
                className="rounded-xl bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-deep">
                {mode === 'add' ? 'Schedule Exam' : 'Save Changes'}
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

const inp = (hasErr) =>
  `w-full rounded-lg border ${hasErr ? 'border-rose-300' : 'border-border'} bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:outline-none focus:border-navy transition-colors`
