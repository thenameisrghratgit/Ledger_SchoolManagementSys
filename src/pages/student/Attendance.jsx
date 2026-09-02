import { useMemo, useState } from 'react'
import { ClipboardCheck, UserCheck, UserX, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_STUDENTS } from '../../data/students.js'

// Generate demo attendance for the last 3 months
function generateAttendance(studentId) {
  const records = []
  const today = new Date()
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const day = d.getDay()
    if (day === 0) continue // skip Sundays
    const rand = Math.random()
    const status = rand < 0.88 ? 'P' : rand < 0.95 ? 'L' : 'A'
    records.push({ date: d.toISOString().split('T')[0], status, studentId })
  }
  return records
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtMonth(year, month) {
  return `${MONTH_NAMES[month]} ${year}`
}

const STATUS_STYLE = {
  P: 'bg-emerald-500 text-white',
  A: 'bg-rose-500 text-white',
  L: 'bg-amber-400 text-white',
}
const STATUS_LABEL = { P: 'Present', A: 'Absent', L: 'Late' }

export default function StudentAttendance() {
  const { user } = useAuth()
  const studentId = user?.studentId || 'STU-2026-0142'
  const student = SEED_STUDENTS.find((s) => s.studentId === studentId) || SEED_STUDENTS[0]

  const records = useMemo(() => generateAttendance(studentId), [studentId])
  const byDate = useMemo(() => {
    const m = {}
    records.forEach((r) => { m[r.date] = r.status })
    return m
  }, [records])

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    const n = new Date(viewYear, viewMonth + 1, 1)
    if (n <= today) {
      if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
      else setViewMonth((m) => m + 1)
    }
  }

  // Calendar days for current view
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const monthRecords = records.filter((r) => {
    const d = new Date(r.date + 'T00:00:00')
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })
  const pCount = monthRecords.filter((r) => r.status === 'P').length
  const aCount = monthRecords.filter((r) => r.status === 'A').length
  const lCount = monthRecords.filter((r) => r.status === 'L').length
  const total  = pCount + aCount + lCount
  const rate   = total > 0 ? Math.round(((pCount + lCount) / total) * 100) : 0

  const totalAll  = records.length
  const pAll      = records.filter((r) => r.status === 'P').length
  const aAll      = records.filter((r) => r.status === 'A').length
  const rateAll   = totalAll > 0 ? Math.round(((pAll + (totalAll - pAll - aAll)) / totalAll) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">My Attendance</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Personal attendance history for {student.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Overall Rate"  value={`${rateAll}%`} sub="Last 90 days"        icon={ClipboardCheck} tone="navy" />
        <StatCard label="Present"       value={pAll}          sub="Days present"         icon={UserCheck}      tone="emerald" />
        <StatCard label="Absent"        value={aAll}          sub="Days missed"          icon={UserX}          tone="rose" />
        <StatCard label="Late"          value={totalAll - pAll - aAll} sub="Late arrivals" icon={Clock}         tone="gold" />
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-text">{fmtMonth(viewYear, viewMonth)}</p>
            <p className="text-[13px] text-text-secondary mt-0.5">
              {pCount}P · {aCount}A · {lCount}L · {rate}% attendance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={nextMonth} disabled={viewYear === today.getFullYear() && viewMonth === today.getMonth()}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text transition-colors disabled:opacity-40">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
            <div key={d} className="py-1 text-center text-[11.5px] font-semibold uppercase tracking-wide text-text-secondary">{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const status = byDate[iso]
            const isToday = iso === today.toISOString().split('T')[0]
            const isFuture = new Date(iso) > today
            return (
              <div key={day}
                className={`flex h-9 w-full items-center justify-center rounded-lg text-[13px] font-medium transition-colors
                  ${status ? STATUS_STYLE[status] : isFuture ? 'text-text-secondary/30' : 'bg-surface text-text-secondary'}
                  ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                title={status ? STATUS_LABEL[status] : undefined}
              >
                {day}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {[['bg-emerald-500', 'Present'], ['bg-rose-500', 'Absent'], ['bg-amber-400', 'Late'], ['bg-surface border border-border text-text-secondary', 'Holiday / No school']].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-1.5 text-[12.5px] text-text-secondary">
              <span className={`h-3 w-3 rounded-sm ${cls}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
