import { useEffect, useMemo, useState } from 'react'
import {
  Wallet, TrendingUp, AlertCircle, CheckCircle2,
  Search, ChevronLeft, ChevronRight, CheckCheck, X, Receipt,
  Plus, Pencil, Trash2,
} from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import Button from '../../components/ui/Button.jsx'
import TextInput from '../../components/ui/TextInput.jsx'
import SelectInput from '../../components/ui/SelectInput.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import { FEE_TYPES, FEE_STATUS } from '../../data/fees.js'
import { CLASS_OPTIONS } from '../../data/students.js'
import { getFees, upsertFee, deleteFee, markFeePaid } from '../../api/fees.js'
import { getStudents } from '../../api/students.js'
import { friendlyError } from '../../lib/errors.js'

const PAGE_SIZE = 8

const STATUS_STYLE = {
  Paid:    { pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: '#10b981' },
  Pending: { pill: 'bg-amber-50 text-amber-700 border-amber-100',      dot: '#f59e0b' },
  Overdue: { pill: 'bg-rose-50 text-rose-700 border-rose-100',         dot: '#f43f5e' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtINR(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nextFeeId(rows) {
  let max = 0
  rows.forEach((f) => {
    const m = /^FEE-(\d+)$/.exec(f.id || '')
    if (m) max = Math.max(max, parseInt(m[1], 10))
  })
  return 'FEE-' + String(max + 1).padStart(4, '0')
}

export default function Fees() {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [markTarget, setMarkTarget] = useState(null)
  const [modal, setModal] = useState(null) // { mode: 'add'|'edit', fee }
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getFees(), getStudents()]).then(([feeRes, stuRes]) => {
      if (cancelled) return
      if (feeRes.error) setError(friendlyError(feeRes.error))
      else setFees(feeRes.data || [])
      if (stuRes.error) setActionError(friendlyError(stuRes.error))
      else setStudents(stuRes.data || [])
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
    return fees.filter((f) => {
      const matchQ = !q || (f.studentName || '').toLowerCase().includes(q) || (f.studentId || '').toLowerCase().includes(q) || (f.id || '').toLowerCase().includes(q)
      const matchS = !statusFilter || f.status === statusFilter
      const matchC = !classFilter  || f.className === classFilter
      const matchT = !typeFilter   || f.type === typeFilter
      return matchQ && matchS && matchC && matchT
    })
  }, [fees, search, statusFilter, classFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safe = Math.min(page, totalPages)
  const rows = filtered.slice((safe - 1) * PAGE_SIZE, safe * PAGE_SIZE)
  const reset = () => setPage(1)

  const reloadFees = async () => {
    const { data, error: err } = await getFees()
    if (err) setActionError(friendlyError(err))
    else setFees(data || [])
  }

  const markPaid = async () => {
    const target = markTarget
    const today = todayISO()
    setActionError('')
    setMarkTarget(null)
    const { error: err } = await markFeePaid(target.id, today)
    if (err) {
      setActionError(friendlyError(err))
      return
    }
    setFees((prev) => prev.map((f) => (f.id === target.id ? { ...f, status: 'Paid', paidDate: today } : f)))
  }

  const handleSave = async (form) => {
    setActionError('')
    const payload = {
      id: form.id || nextFeeId(fees),
      studentId: form.studentId,
      type: form.type,
      amount: Number(form.amount),
      dueDate: form.dueDate,
      paidDate: form.paidDate || null,
      status: form.status || 'Pending',
    }
    const { error: err } = await upsertFee(payload)
    if (err) {
      setActionError(friendlyError(err))
      return
    }
    setModal(null)
    await reloadFees()
  }

  const handleDeleteConfirm = async () => {
    setActionError('')
    const target = deleteTarget
    setDeleteTarget(null)
    const { error: err } = await deleteFee(target.id)
    if (err) {
      setActionError(friendlyError(err))
      return
    }
    setFees((prev) => prev.filter((f) => f.id !== target.id))
  }

  // Aggregates
  const totalCollected = fees.filter((f) => f.status === 'Paid').reduce((s, f) => s + Number(f.amount || 0), 0)
  const totalPending   = fees.filter((f) => f.status === 'Pending').reduce((s, f) => s + Number(f.amount || 0), 0)
  const totalOverdue   = fees.filter((f) => f.status === 'Overdue').reduce((s, f) => s + Number(f.amount || 0), 0)
  const paidCount  = fees.filter((f) => f.status === 'Paid').length
  const overdueCount = fees.filter((f) => f.status === 'Overdue').length

  const hasFilter = search || statusFilter || classFilter || typeFilter
  const clearAll = () => { setSearch(''); setStatusFilter(''); setClassFilter(''); setTypeFilter(''); reset() }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-text">Fee Management</h2>
          <p className="mt-1 text-[14.5px] text-text-secondary">Track collections, pending dues, and payment history</p>
        </div>
        <Button
          variant="primary"
          className="!w-auto shrink-0 self-start px-5 sm:self-auto"
          onClick={() => { setActionError(''); setModal({ mode: 'add', fee: null }) }}
        >
          <Plus size={17} /> Add Fee
        </Button>
      </div>

      {(actionError || error) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {actionError || error}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Collected"   value={loading ? '—' : fmtINR(totalCollected)} sub={`${paidCount} payments`}          icon={CheckCircle2} tone="emerald" />
        <StatCard label="Pending"           value={loading ? '—' : fmtINR(totalPending)}   sub="Awaiting payment"                  icon={TrendingUp}   tone="gold" />
        <StatCard label="Overdue"           value={loading ? '—' : fmtINR(totalOverdue)}   sub={`${overdueCount} records`}         icon={AlertCircle}  tone="rose" />
        <StatCard label="Total Records"     value={loading ? '—' : fees.length}            sub="All fee entries"                   icon={Wallet}       tone="navy" />
      </div>

      {/* Collection rate bar */}
      <div className="rounded-xl border border-border bg-surface-card px-5 py-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-semibold text-text">Collection Overview</p>
          <p className="text-[13px] text-text-secondary">
            {fmtINR(totalCollected)} collected of {fmtINR(totalCollected + totalPending + totalOverdue)} total billed
          </p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface flex gap-0.5">
          {totalCollected > 0 && (
            <div className="h-full rounded-l-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${(totalCollected / (totalCollected + totalPending + totalOverdue)) * 100}%` }} />
          )}
          {totalPending > 0 && (
            <div className="h-full bg-amber-400 transition-all duration-700"
              style={{ width: `${(totalPending / (totalCollected + totalPending + totalOverdue)) * 100}%` }} />
          )}
          {totalOverdue > 0 && (
            <div className="h-full rounded-r-full bg-rose-500 transition-all duration-700"
              style={{ width: `${(totalOverdue / (totalCollected + totalPending + totalOverdue)) * 100}%` }} />
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-4">
          {[
            { label: 'Paid', color: 'bg-emerald-500', value: totalCollected },
            { label: 'Pending', color: 'bg-amber-400', value: totalPending },
            { label: 'Overdue', color: 'bg-rose-500', value: totalOverdue },
          ].map(({ label, color, value }) => (
            <div key={label} className="flex items-center gap-2 text-[12.5px] text-text-secondary">
              <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
              {label}: {fmtINR(value)}
            </div>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-surface-card p-4 shadow-card sm:p-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); reset() }}
              placeholder="Search by student or fee ID"
              className="focus-ring w-full rounded-lg border border-border bg-surface-card py-2.5 pl-10 pr-3.5 text-[14px] text-text placeholder:text-text-secondary transition-colors hover:border-[#C6D0DB] focus:border-navy"
            />
          </div>
          {[
            { value: statusFilter, onChange: (v) => { setStatusFilter(v); reset() }, options: FEE_STATUS, placeholder: 'All Status' },
            { value: classFilter,  onChange: (v) => { setClassFilter(v); reset() },  options: CLASS_OPTIONS, placeholder: 'All Classes' },
            { value: typeFilter,   onChange: (v) => { setTypeFilter(v); reset() },   options: FEE_TYPES,     placeholder: 'All Types' },
          ].map(({ value, onChange, options, placeholder }) => (
            <select key={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
              className="focus-ring rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:border-navy">
              <option value="">{placeholder}</option>
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          {hasFilter && (
            <button onClick={clearAll} className="shrink-0 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-navy hover:underline">
              Clear
            </button>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            </div>
          ) : (
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {['Fee ID', 'Student', 'Class', 'Fee Type', 'Amount', 'Due Date', 'Paid On', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={9} className="py-10 text-center text-[14px] text-text-secondary">No records found.</td></tr>
              )}
              {rows.map((f) => {
                const statusStyle = STATUS_STYLE[f.status] || STATUS_STYLE.Pending
                return (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-3 py-3.5 text-[12.5px] font-medium text-text-secondary">{f.id}</td>
                  <td className="px-3 py-3.5">
                    <p className="text-[13.5px] font-medium text-text">{f.studentName}</p>
                    <p className="text-[12px] text-text-secondary">{f.studentId}</p>
                  </td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{f.className}</td>
                  <td className="px-3 py-3.5">
                    <span className="rounded-md bg-navy/[0.06] px-2 py-0.5 text-[12px] font-medium text-navy">{f.type}</span>
                  </td>
                  <td className="px-3 py-3.5 text-[13.5px] font-semibold text-text">{fmtINR(f.amount)}</td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{fmtDate(f.dueDate)}</td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{fmtDate(f.paidDate)}</td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${statusStyle.pill}`}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusStyle.dot }} />
                      {f.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {f.status !== 'Paid' ? (
                        <button onClick={() => setMarkTarget(f)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100">
                          <CheckCheck size={13} /> Mark Paid
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                          <Receipt size={13} /> Received
                        </span>
                      )}
                      <RowButton label="Edit" onClick={() => { setActionError(''); setModal({ mode: 'edit', fee: f }) }}>
                        <Pencil size={15} />
                      </RowButton>
                      <RowButton label="Delete" tone="rose" onClick={() => setDeleteTarget(f)}>
                        <Trash2 size={15} />
                      </RowButton>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
          <p className="text-[13px] text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (safe - 1) * PAGE_SIZE + 1}–{Math.min(safe * PAGE_SIZE, filtered.length)} of {filtered.length} records
          </p>
          <div className="flex items-center gap-2">
            <PgBtn disabled={safe === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={15} /></PgBtn>
            <span className="px-2 text-[13.5px] font-medium text-text">Page {safe} of {totalPages}</span>
            <PgBtn disabled={safe === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={15} /></PgBtn>
          </div>
        </div>
      </div>

      {/* Mark paid confirmation */}
      {markTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 mb-4">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-[16px] font-semibold text-text">Mark as Paid?</h3>
            <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">
              Record payment of <span className="font-semibold text-text">{fmtINR(markTarget.amount)}</span> ({markTarget.type}) from{' '}
              <span className="font-medium text-text">{markTarget.studentName}</span>?
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setMarkTarget(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-[13.5px] font-medium text-text hover:bg-surface">
                Cancel
              </button>
              <button onClick={markPaid}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-emerald-700">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <FeeModal
          mode={modal.mode}
          fee={modal.fee}
          students={students}
          error={actionError}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this fee?"
          description={`This will permanently remove fee ${deleteTarget.id} (${deleteTarget.type}, ${fmtINR(deleteTarget.amount)}) for ${deleteTarget.studentName || deleteTarget.studentId}. This action cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

function FeeModal({ mode, fee, students, error, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    id: fee?.id || '',
    studentId: fee?.studentId || '',
    type: fee?.type || FEE_TYPES[0],
    amount: fee?.amount ?? '',
    dueDate: fee?.dueDate || '',
    paidDate: fee?.paidDate || '',
    status: fee?.status || 'Pending',
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.studentId) next.studentId = 'Select a student.'
    if (!form.type) next.type = 'Select a fee type.'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Enter a valid amount.'
    if (!form.dueDate) next.dueDate = 'Select a due date.'
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const studentOptions = [...students]
  if (form.studentId && !studentOptions.some((s) => s.studentId === form.studentId)) {
    studentOptions.unshift({
      studentId: form.studentId,
      name: fee?.studentName || form.studentId,
      className: fee?.className || '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface-card shadow-card-hover">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-[17px] font-semibold text-text">{mode === 'add' ? 'Add Fee' : 'Edit Fee'}</h2>
            <p className="mt-0.5 text-[13.5px] text-text-secondary">
              {mode === 'add' ? 'Enter the new fee record below.' : 'Update the fee record.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {error && (
            <p className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </p>
          )}
          <form id="fee-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-text">Student</label>
              <select
                value={form.studentId}
                onChange={set('studentId')}
                className={`w-full rounded-lg border bg-surface-card px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-secondary focus:outline-none focus:border-navy transition-colors ${errors.studentId ? 'border-rose-300' : 'border-border'}`}
              >
                <option value="">Select student</option>
                {studentOptions.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.name}{s.className ? ` · ${s.className}` : ''}
                  </option>
                ))}
              </select>
              {errors.studentId && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.studentId}</p>}
            </div>
            <SelectInput label="Fee type" placeholder="Select fee type" options={FEE_TYPES} value={form.type} onChange={set('type')} error={errors.type} />
            <SelectInput label="Status" placeholder="Select status" options={FEE_STATUS} value={form.status} onChange={set('status')} />
            <TextInput label="Amount" type="number" min="0" placeholder="18500" value={form.amount} onChange={set('amount')} error={errors.amount} />
            <TextInput label="Due date" type="date" value={form.dueDate} onChange={set('dueDate')} error={errors.dueDate} />
            <TextInput label="Paid date" type="date" value={form.paidDate} onChange={set('paidDate')} error={errors.paidDate} />
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="secondary" className="!w-auto px-5" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="fee-form" variant="primary" className="!w-auto px-5" loading={saving}>Save Fee</Button>
        </div>
      </div>
    </div>
  )
}

function RowButton({ label, tone = 'navy', onClick, children }) {
  const tones = {
    navy: 'text-text-secondary hover:bg-navy/[0.08] hover:text-navy',
    rose: 'text-text-secondary hover:bg-rose-50 hover:text-rose-500',
  }
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`focus-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 ${tones[tone]}`}
    >
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
