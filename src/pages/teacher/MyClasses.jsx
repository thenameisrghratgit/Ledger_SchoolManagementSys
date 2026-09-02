import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_TEACHERS } from '../../data/teachers.js'
import { SEED_TIMETABLES, DAYS, SHORT_DAYS, PERIODS } from '../../data/timetable.js'

const SUBJECT_COLORS = {
  'Mathematics': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', dot: '#3b82f6' },
  'Physics':     { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-800', dot: '#7c3aed' },
  'Chemistry':   { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: '#059669' },
  'Biology':     { bg: 'bg-lime-50 border-lime-200', text: 'text-lime-800', dot: '#65a30d' },
  'English':     { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', dot: '#0284c7' },
  'Hindi':       { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', dot: '#ea580c' },
  'Social Studies': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: '#d97706' },
  'Computer Sc.':{ bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', dot: '#4f46e5' },
}
const defaultCol = { bg: 'bg-surface border-border', text: 'text-text-secondary', dot: '#aaa' }
const getCol = (s) => (s && SUBJECT_COLORS[s]) || defaultCol

const CLASSES = ['Class 9', 'Class 10']

export default function TeacherMyClasses() {
  const { user } = useAuth()
  const teacherId = user?.teacherId || 'TCH-001'
  const teacher   = SEED_TEACHERS.find((t) => t.teacherId === teacherId) || SEED_TEACHERS[0]

  const [selectedClass, setSelectedClass] = useState(CLASSES[0])
  const data = SEED_TIMETABLES[selectedClass] || {}

  const contentPeriods = PERIODS.filter((p) => !p.isBreak)
  let ci = 0; const pidxMap = {}
  PERIODS.forEach((p) => { if (!p.isBreak) { pidxMap[p.id] = ci; ci++ } })

  // Only highlight cells belonging to this teacher
  const isMyCell = (cell) => cell && teacher.subjects.some((s) => cell.s.includes(s.split(' ')[0]))

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-text">My Classes</h2>
          <p className="mt-1 text-[14.5px] text-text-secondary">Weekly timetable — your assigned periods are highlighted</p>
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-xl border border-border bg-surface-card px-4 py-2.5 text-[14px] font-medium text-text focus:border-navy focus:outline-none">
          {CLASSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-surface-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr style={{ background: 'rgba(196,98,45,0.04)' }}>
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
                <tr key={day} className={di % 2 === 0 ? 'bg-white' : 'bg-surface/40'}>
                  <td className="border-b border-r border-border px-4 py-3">
                    <p className="text-[13px] font-semibold text-text">{SHORT_DAYS[di]}</p>
                    <p className="text-[11px] text-text-secondary">{day.slice(3)}</p>
                  </td>
                  {contentPeriods.map((p) => {
                    const cell = data[day]?.[pidxMap[p.id]]
                    const mine = isMyCell(cell)
                    const col = mine ? getCol(cell.s) : defaultCol
                    return (
                      <td key={p.id} className="border-b border-r border-border p-1.5 last:border-r-0" style={{ minWidth: 100 }}>
                        {cell ? (
                          <div className={`rounded-md border px-2 py-1.5 ${mine ? col.bg : 'bg-surface/50 border-border/50 opacity-40'}`} style={{ minHeight: 52 }}>
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: mine ? col.dot : '#aaa' }} />
                              <p className={`text-[12px] font-semibold truncate ${mine ? col.text : 'text-text-secondary'}`}>{cell.s}</p>
                            </div>
                            <p className="mt-0.5 text-[11px] text-text-secondary truncate pl-3">{cell.t}</p>
                          </div>
                        ) : (
                          <div className="flex h-[52px] items-center justify-center rounded-md border border-dashed border-border/50">
                            <span className="text-[11px] text-text-secondary/30">—</span>
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

      <div className="flex items-center gap-3 text-[12.5px] text-text-secondary">
        <span className="h-3 w-3 rounded-sm bg-violet-100 border border-violet-200" /> Your periods highlighted · other periods dimmed
      </div>
    </div>
  )
}
