import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_STUDENTS } from '../../data/students.js'

const STATUS_COLOR = { P: '#059669', A: '#e11d48', L: '#d97706' }
const STATUS_BG    = { P: '#d1fae5', A: '#fee2e2', L: '#fef3c7' }
const STATUS_LABEL = { P: 'Present', A: 'Absent', L: 'Late' }

function generateAttendance(studentId) {
  const records = {}
  const today = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue
    const r = Math.random()
    records[d.toISOString().split('T')[0]] = r < 0.88 ? 'P' : r < 0.95 ? 'L' : 'A'
  }
  return records
}

export default function ParentAttendance() {
  const { user } = useAuth()
  const childId = user?.childStudentId || 'STU-2026-0142'
  const child   = SEED_STUDENTS.find((s) => s.studentId === childId) || SEED_STUDENTS[0]

  const records = useMemo(() => generateAttendance(child.studentId), [child.studentId])

  const today     = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

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
  monthRecords.forEach(([, v]) => { counts[v]++ })
  const total = counts.P + counts.A + counts.L
  const rate  = total > 0 ? Math.round(((counts.P + counts.L) / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Attendance — {child.name}</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">{child.className} · Section {child.section}</p>
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
            const isToday = c.iso === today.toISOString().split('T')[0]
            return (
              <div key={c.iso} className={`flex flex-col items-center justify-center rounded-xl py-2 text-center transition-all ${isToday ? 'ring-2 ring-violet-400' : ''}`}
                style={{ background: c.status ? STATUS_BG[c.status] : 'transparent' }}>
                <span className="text-[13px] font-semibold" style={{ color: c.status ? STATUS_COLOR[c.status] : '#9ca3af' }}>{c.d}</span>
                {c.status && <span className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wide" style={{ color: STATUS_COLOR[c.status] }}>{c.status}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 text-[12.5px] text-text-secondary">
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: STATUS_BG[k], border: `1.5px solid ${STATUS_COLOR[k]}` }} />
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}
