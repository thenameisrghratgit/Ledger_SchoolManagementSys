import { Wallet, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_FEES } from '../../data/fees.js'

const STATUS_STYLE = {
  Paid:    { pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: '#10b981' },
  Pending: { pill: 'bg-amber-50 text-amber-700 border-amber-100',      dot: '#f59e0b' },
  Overdue: { pill: 'bg-rose-50 text-rose-700 border-rose-100',         dot: '#f43f5e' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function StudentFees() {
  const { user } = useAuth()
  const studentId = user?.studentId || 'STU-2026-0142'
  const myFees = SEED_FEES.filter((f) => f.studentId === studentId)

  const paid    = myFees.filter((f) => f.status === 'Paid')
  const pending = myFees.filter((f) => f.status !== 'Paid')
  const totalPaid    = paid.reduce((s, f) => s + f.amount, 0)
  const totalPending = pending.reduce((s, f) => s + f.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">My Fees</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Fee records and payment status</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Records"    value={myFees.length}               sub="All fee entries"   icon={Wallet}       tone="navy" />
        <StatCard label="Paid"             value={`₹${totalPaid.toLocaleString('en-IN')}`} sub={`${paid.length} payments`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Pending / Overdue" value={`₹${totalPending.toLocaleString('en-IN')}`} sub={`${pending.length} records`} icon={AlertCircle} tone="rose" />
        <StatCard label="Collection Rate"  value={myFees.length ? `${Math.round((paid.length / myFees.length) * 100)}%` : '—'} sub="Fees cleared" icon={TrendingUp} tone="gold" />
      </div>

      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[14px] font-semibold text-amber-800">
            You have {pending.length} pending payment{pending.length > 1 ? 's' : ''} totalling ₹{totalPending.toLocaleString('en-IN')}.
          </p>
          <p className="mt-1 text-[13px] text-amber-700">Please contact the school accounts office to clear dues.</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface-card shadow-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[15px] font-semibold text-text">Fee Records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Fee ID', 'Type', 'Amount', 'Due Date', 'Paid On', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myFees.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-[14px] text-text-secondary">No fee records found.</td></tr>
              )}
              {myFees.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-4 py-3.5 text-[12.5px] text-text-secondary">{f.id}</td>
                  <td className="px-4 py-3.5"><span className="rounded-md bg-navy/[0.06] px-2 py-0.5 text-[12px] font-medium text-navy">{f.type}</span></td>
                  <td className="px-4 py-3.5 text-[14px] font-semibold text-text">₹{f.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5 text-[13.5px] text-text-secondary">{fmtDate(f.dueDate)}</td>
                  <td className="px-4 py-3.5 text-[13.5px] text-text-secondary">{fmtDate(f.paidDate)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[f.status].pill}`}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_STYLE[f.status].dot }} />
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
