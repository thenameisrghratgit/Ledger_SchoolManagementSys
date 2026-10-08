import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { DAYS, SHORT_DAYS, PERIODS } from '../../data/timetable.js'
import { getTimetableForClass } from '../../api/timetable.js'
import { friendlyError } from '../../lib/errors.js'

const SUBJECT_COLORS = {
  'Mathematics':   { bg: 'bg-blue-50 border-blue-200',     text: 'text-blue-800',   dot: '#3b82f6' },
  'Physics':       { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-800', dot: '#7c3aed' },
  'Chemistry':     { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: '#059669' },
  'Biology':       { bg: 'bg-lime-50 border-lime-200',     text: 'text-lime-800',   dot: '#65a30d' },
  'English':       { bg: 'bg-sky-50 border-sky-200',       text: 'text-sky-800',    dot: '#0284c7' },
  'Hindi':         { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', dot: '#ea580c' },
  'Social Studies':{ bg: 'bg-amber-50 border-amber-200',   text: 'text-amber-800',  dot: '#d97706' },
  'Computer Sc.':  { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', dot: '#4f46e5' },
  'Fine Arts':     { bg: 'bg-pink-50 border-pink-200',     text: 'text-pink-800',   dot: '#db2777' },
  'Phys. Ed.':     { bg: 'bg-teal-50 border-teal-200',     text: 'text-teal-800',   dot: '#0d9488' },
}
const defaultCol = { bg: 'bg-surface border-border', text: 'text-text-secondary', dot: '#aaa' }
const getCol = (s) => (s && SUBJECT_COLORS[s]) || defaultCol

export default function StudentTimetable() {
  const { user } = useAuth()
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const className = user?.className

  useEffect(() => {
    if (!className) {
      setLoading(false)
      return undefined
    }
    let cancelled = false
    getTimetableForClass(className).then(({ data: grid, error: err }) => {
      if (cancelled) return
      if (err) setError(friendlyError(err))
      else setData(grid || {})
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [className])

  if (!className) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        Your student record is missing. Please contact your administrator.
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-14">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    )
  }

  const contentPeriods = PERIODS.filter((p) => !p.isBreak)
  let ci = 0
  const pidxMap = {}
  PERIODS.forEach((p) => { if (!p.isBreak) { pidxMap[p.id] = ci; ci++ } })

  const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">My Timetable</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">{className} – Section {user.section} weekly schedule</p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Period legend */}
      <div className="flex flex-wrap gap-2">
        {contentPeriods.map((p) => (
          <span key={p.id} className="rounded-lg border border-border bg-surface-card px-3 py-1.5 text-[12px] font-medium text-text-secondary">
            <span className="font-semibold text-text">{p.label}</span> · {p.time}
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr style={{ background: 'rgba(59,130,246,0.04)' }}>
                <th className="w-[90px] border-b border-r border-border px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">Day</th>
                {contentPeriods.map((p) => (
                  <th key={p.id} className="border-b border-r border-border px-2 py-3 text-center last:border-r-0">
                    <p className="text-[12px] font-semibold text-text">{p.label}</p>
                    <p className="text-[11px] text-text-secondary">{p.time}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, di) => (
                <tr key={day} className={`${day === today ? 'bg-blue-50/40' : di % 2 === 0 ? 'bg-white' : 'bg-surface/40'}`}>
                  <td className="border-b border-r border-border px-4 py-3">
                    <p className="text-[13px] font-semibold text-text flex items-center gap-1.5">
                      {SHORT_DAYS[di]}
                      {day === today && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />}
                    </p>
                    <p className="text-[11px] text-text-secondary">{day.slice(3)}</p>
                  </td>
                  {contentPeriods.map((p) => {
                    const cell = data[day]?.[pidxMap[p.id]]
                    const col = getCol(cell?.s)
                    return (
                      <td key={p.id} className="border-b border-r border-border p-1.5 last:border-r-0 align-top" style={{ minWidth: 100 }}>
                        {cell ? (
                          <div className={`rounded-md border px-2 py-1.5 ${col.bg}`} style={{ minHeight: 52 }}>
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: col.dot }} />
                              <p className={`text-[12px] font-semibold truncate ${col.text}`}>{cell.s || '—'}</p>
                            </div>
                            <p className="mt-0.5 text-[11px] text-text-secondary truncate pl-3">{cell.t || '—'}</p>
                          </div>
                        ) : (
                          <div className="flex h-[52px] items-center justify-center rounded-md border border-dashed border-border">
                            <span className="text-[11px] text-text-secondary/40">—</span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[12.5px] text-text-secondary">Breaks: Short break 9:30–9:50 · Lunch 11:20–12:00 · Today highlighted in blue</p>
    </div>
  )
}
