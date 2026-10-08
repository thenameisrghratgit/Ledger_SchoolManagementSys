import { useEffect, useState } from 'react'
import { CreditCard, Check, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getStudentById } from '../../api/students.js'
import { getFeesForStudent, markFeePaid } from '../../api/fees.js'
import { friendlyError } from '../../lib/errors.js'

const STATUS_STYLE = {
  Paid:    { pill: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  Pending: { pill: 'border-amber-200 bg-amber-50 text-amber-700' },
  Overdue: { pill: 'border-rose-200 bg-rose-50 text-rose-700' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtINR(n) { return '₹' + Number(n || 0).toLocaleString('en-IN') }
function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function PayModal({ fee, error, busy, onConfirm, onClose }) {
  const [method, setMethod] = useState('UPI')
  const METHODS = ['UPI', 'Net Banking', 'Credit Card', 'Debit Card']
  const handleOverlay = () => { if (!busy) onClose() }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleOverlay}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[16px] font-bold text-text">Pay Fee</p>
          <button onClick={handleOverlay} disabled={busy} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface disabled:opacity-50"><X size={16} /></button>
        </div>

        <div className="mb-5 rounded-xl border border-border bg-surface p-4">
          <div className="flex justify-between text-[13.5px]">
            <span className="text-text-secondary">Fee Type</span>
            <span className="font-semibold text-text">{fee.type}</span>
          </div>
          <div className="mt-2 flex justify-between text-[13.5px]">
            <span className="text-text-secondary">Due Date</span>
            <span className={`font-semibold ${fee.status === 'Overdue' ? 'text-rose-600' : 'text-text'}`}>{fmtDate(fee.dueDate)}</span>
          </div>
          <div className="mt-3 border-t border-border pt-3 flex justify-between">
            <span className="text-[14px] font-semibold text-text">Amount</span>
            <span className="text-[18px] font-bold text-violet-700">{fmtINR(fee.amount)}</span>
          </div>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button key={m} onClick={() => setMethod(m)}
                className={`rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-all ${
                  method === m ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-border bg-surface-card text-text hover:border-violet-300'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            {error}
          </p>
        )}

        <button onClick={() => onConfirm(fee.id)} disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: '#7C3AED' }}>
          <CreditCard size={16} /> Pay {fmtINR(fee.amount)} via {method}
        </button>
      </div>
    </div>
  )
}

function SuccessToast({ fee, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check size={18} className="text-emerald-600" />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-text">Payment Successful</p>
        <p className="text-[12.5px] text-text-secondary">{fee.type} · {fmtINR(fee.amount)} paid</p>
      </div>
      <button onClick={onClose} className="ml-2 text-text-secondary hover:text-text"><X size={14} /></button>
    </div>
  )
}

export default function ParentFees() {
  const { user } = useAuth()
  const childId = user?.childStudentId

  const [child, setChild] = useState(null)
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(!!childId)
  const [error, setError] = useState('')
  const [payTarget, setPayTarget] = useState(null)
  const [payError, setPayError] = useState('')
  const [paying, setPaying] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      const [childRes, feeRes] = await Promise.all([
        getStudentById(childId),
        getFeesForStudent(childId),
      ])
      if (cancelled) return
      if (childRes.error) { setError(friendlyError(childRes.error)); setLoading(false); return }
      if (!childRes.data) { setError('Linked student record not found. Please contact the school office.'); setLoading(false); return }
      if (feeRes.error) setError(friendlyError(feeRes.error))
      setChild(childRes.data)
      setFees(feeRes.data || [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [childId])

  const reloadFees = async () => {
    const { data, error: err } = await getFeesForStudent(childId)
    if (err) { setError(friendlyError(err)); return }
    setFees(data || [])
    setError('')
  }

  const total    = fees.reduce((s, f) => s + Number(f.amount || 0), 0)
  const paidAmt  = fees.filter((f) => f.status === 'Paid').reduce((s, f) => s + Number(f.amount || 0), 0)
  const pendAmt  = fees.filter((f) => f.status === 'Pending').reduce((s, f) => s + Number(f.amount || 0), 0)
  const overdAmt = fees.filter((f) => f.status === 'Overdue').reduce((s, f) => s + Number(f.amount || 0), 0)

  const paidPct  = total ? Math.round((paidAmt / total) * 100) : 0
  const pendPct  = total ? Math.round((pendAmt / total) * 100) : 0
  const overdPct = total ? Math.round((overdAmt / total) * 100) : 0

  const handleConfirm = async (feeId) => {
    if (paying) return
    setPayError('')
    setToast(null)
    setPaying(true)
    const { error: err } = await markFeePaid(feeId, todayISO())
    setPaying(false)
    if (err) { setPayError(friendlyError(err)); return }
    const fee = fees.find((f) => f.id === feeId)
    setPayTarget(null)
    if (fee) setToast(fee)
    await reloadFees()
  }

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
            <h2 className="text-[20px] font-semibold tracking-tight text-text">Fees — {child.name}</h2>
            <p className="mt-1 text-[14.5px] text-text-secondary">{child.className} · {child.studentId}</p>
          </div>

          {/* Progress bar */}
          <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[14px] font-semibold text-text">Fee Overview</p>
              <p className="text-[13.5px] font-semibold text-text">{fmtINR(total)} total</p>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${paidPct}%` }} />
              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${pendPct}%` }} />
              <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${overdPct}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[12.5px]">
              <span className="flex items-center gap-1.5 text-emerald-700"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Paid {fmtINR(paidAmt)} ({paidPct}%)</span>
              <span className="flex items-center gap-1.5 text-amber-700"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Pending {fmtINR(pendAmt)} ({pendPct}%)</span>
              <span className="flex items-center gap-1.5 text-rose-700"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Overdue {fmtINR(overdAmt)} ({overdPct}%)</span>
            </div>
          </div>

          {overdAmt > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
              <p className="text-[14px] font-semibold text-rose-700">
                {fmtINR(overdAmt)} overdue — clear dues to avoid late penalties.
              </p>
              <button onClick={() => { setPayError(''); setPayTarget(fees.find((f) => f.status === 'Overdue')) }}
                className="ml-4 shrink-0 rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-rose-700 transition-colors">
                Pay Now
              </button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-border bg-surface-card shadow-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-text">Fee Records</p>
            </div>
            {fees.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-text-secondary">No fee records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface/60">
                      {['Fee Type','Amount','Due Date','Paid On','Status',''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((f) => (
                      <tr key={f.id} className="border-b border-border last:border-0 hover:bg-surface/40">
                        <td className="px-4 py-3 text-[14px] font-medium text-text">{f.type}</td>
                        <td className="px-4 py-3 text-[14px] font-semibold text-text">{fmtINR(f.amount)}</td>
                        <td className="px-4 py-3 text-[13px] text-text-secondary">{fmtDate(f.dueDate)}</td>
                        <td className="px-4 py-3 text-[13px] text-text-secondary">{fmtDate(f.paidDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[f.status]?.pill || ''}`}>{f.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {f.status !== 'Paid' && (
                            <button onClick={() => { setPayError(''); setPayTarget(f) }}
                              className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-[12.5px] font-semibold text-violet-700 hover:bg-violet-100 transition-colors">
                              <CreditCard size={13} /> Pay
                            </button>
                          )}
                          {f.status === 'Paid' && (
                            <span className="flex items-center gap-1 text-[12.5px] font-medium text-emerald-600">
                              <Check size={13} /> Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {payTarget && <PayModal fee={payTarget} error={payError} busy={paying} onConfirm={handleConfirm} onClose={() => setPayTarget(null)} />}
          {toast && <SuccessToast fee={toast} onClose={() => setToast(null)} />}
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
