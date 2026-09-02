import { useMemo, useState } from 'react'
import {
  Wallet, TrendingUp, AlertCircle, CheckCircle2,
  Search, ChevronLeft, ChevronRight, CheckCheck, X, Receipt,
} from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { SEED_FEES, FEE_TYPES, FEE_STATUS } from '../../data/fees.js'
import { CLASS_OPTIONS } from '../../data/students.js'

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
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function Fees() {
  const [fees, setFees] = useState(SEED_FEES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [markTarget, setMarkTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return fees.filter((f) => {
      const matchQ = !q || f.studentName.toLowerCase().includes(q) || f.studentId.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)
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

  const markPaid = () => {
    const today = new Date().toISOString().split('T')[0]
    setFees((prev) =>
      prev.map((f) => f.id === markTarget.id ? { ...f, status: 'Paid', paidDate: today } : f)
    )
    setMarkTarget(null)
  }

  // Aggregates
  const totalCollected = fees.filter((f) => f.status === 'Paid').reduce((s, f) => s + f.amount, 0)
  const totalPending   = fees.filter((f) => f.status === 'Pending').reduce((s, f) => s + f.amount, 0)
  const totalOverdue   = fees.filter((f) => f.status === 'Overdue').reduce((s, f) => s + f.amount, 0)
  const paidCount  = fees.filter((f) => f.status === 'Paid').length
  const overdueCount = fees.filter((f) => f.status === 'Overdue').length

  const hasFilter = search || statusFilter || classFilter || typeFilter
  const clearAll = () => { setSearch(''); setStatusFilter(''); setClassFilter(''); setTypeFilter(''); reset() }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Fee Management</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Track collections, pending dues, and payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Collected"   value={fmtINR(totalCollected)} sub={`${paidCount} payments`}          icon={CheckCircle2} tone="emerald" />
        <StatCard label="Pending"           value={fmtINR(totalPending)}   sub="Awaiting payment"                  icon={TrendingUp}   tone="gold" />
        <StatCard label="Overdue"           value={fmtINR(totalOverdue)}   sub={`${overdueCount} records`}         icon={AlertCircle}  tone="rose" />
        <StatCard label="Total Records"     value={fees.length}            sub="All fee entries"                   icon={Wallet}       tone="navy" />
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
              {rows.map((f) => (
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
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[f.status].pill}`}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_STYLE[f.status].dot }} />
                      {f.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
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
