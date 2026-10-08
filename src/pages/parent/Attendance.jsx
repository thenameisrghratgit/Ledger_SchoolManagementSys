import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getStudentById } from '../../api/students.js'
import { getStudentAttendance } from '../../api/attendance.js'
import { friendlyError } from '../../lib/errors.js'

const STATUS_COLOR = { P: '#059669', A: '#e11d48', L: '#d97706' }
const STATUS_BG    = { P: '#d1fae5', A: '#fee2e2', L: '#fef3c7' }
const STATUS_LABEL = { P: 'Present', A: 'Absent', L: 'Late' }

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ParentAttendance() {
  const { user } = useAuth()
  const childId = user?.childStudentId

  const [child, setChild] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(!!childId)
  const [error, setError] = useState('')

  const today     = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      const [childRes, attRes] = await Promise.all([
        getStudentById(childId),
        getStudentAttendance(childId),
      ])
      if (cancelled) return
      if (childRes.error) { setError(friendlyError(childRes.error)); setLoading(false); return }
      if (!childRes.data) { setError('Linked student record not found. Please contact the school office.'); setLoading(false); return }
      if (attRes.error) setError(friendlyError(attRes.error))
      setChild(childRes.data)
      setRows(attRes.data || [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [childId])

  const records = useMemo(() => {
    const map = {}
    rows.forEach((r) => { map[r.date] = r.status })
    return map
  }, [rows])

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const prevMonth  = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) } else setViewMonth((m) => m - 1) }
  const nextMonth  = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) } else setViewMonth((m) => m + 1) }

  const firstDay  = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMon = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells     = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMon; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ d, iso, status: records[iso] || null })
  }

  const monthRecords = Object.entries(records).filter(([k]) => {
    const [y, m] = k.split('-').map(Number)
    return y === viewYear && m - 1 === viewMonth
  })
  const counts = { P: 0, A: 0, L: 0 }
  monthRecords.forEach(([, v]) => { if (counts[v] !== undefined) counts[v]++ })
  const total = counts.P + counts.A + counts.L
  const rate  = total > 0 ? Math.round(((counts.P + counts.L) / total) * 100) : 0

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
            <h2 className="text-[20px] font-semibold tracking-tight text-text">Attendance — {child.name}</h2>
            <p className="mt-1 text-[14.5px] text-text-secondary">{child.className} · Section {child.section || '—'}</p>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-[15px] font-semibold text-text min-w-[160px] text-center">{monthLabel}</span>
            <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface transition-colors"><ChevronRight size={16} /></button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Object.entries(counts).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-surface-card p-4 shadow-card text-center">
                <p className="text-[22px] font-bold" style={{ color: STATUS_COLOR[k] }}>{v}</p>
                <p className="text-[12.5px] text-text-secondary">{STATUS_LABEL[k]}</p>
              </div>
            ))}
            <div className="rounded-xl border border-border bg-surface-card p-4 shadow-card text-center">
              <p className="text-[22px] font-bold text-text">{rate}%</p>
              <p className="text-[12.5px] text-text-secondary">Rate</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
            <div className="mb-3 grid grid-cols-7 gap-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="py-1.5 text-center text-[11.5px] font-semibold uppercase tracking-wide text-text-secondary">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((c, i) => {
                if (!c) return <div key={i} />
                const isToday = c.iso === todayISO()
                return (
                  <div key={c.iso} className={`flex flex-col items-center justify-center rounded-xl py-2 text-center transition-all ${isToday ? 'ring-2 ring-violet-400' : ''}`}
                    style={{ background: c.status ? STATUS_BG[c.status] : 'transparent' }}>
                    <span className="text-[13px] font-semibold" style={{ color: c.status ? STATUS_COLOR[c.status] : '#9ca3af' }}>{c.d}</span>
                    {c.status && <span className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wide" style={{ color: STATUS_COLOR[c.status] }}>{c.status}</span>}
                  </div>
                )
              })}
            </div>
            {total === 0 && (
              <p className="mt-3 text-center text-[14px] text-text-secondary">No attendance records for this month.</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-[12.5px] text-text-secondary">
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ background: STATUS_BG[k], border: `1.5px solid ${STATUS_COLOR[k]}` }} />
                {v}
              </span>
            ))}
          </div>
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
