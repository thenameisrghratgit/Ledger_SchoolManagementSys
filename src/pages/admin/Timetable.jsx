import { useEffect, useState } from 'react'
import { Pencil, Check, X, AlertCircle } from 'lucide-react'
import {
  DAYS, SHORT_DAYS, PERIODS, TIMETABLE_CLASSES, ALL_SUBJECTS,
} from '../../data/timetable.js'
import { getTimetableForClass, saveTimetableCell } from '../../api/timetable.js'
import { getTeachers } from '../../api/teachers.js'
import { friendlyError } from '../../lib/errors.js'

const SUBJECT_COLORS = {
  'Mathematics':   { bg: 'bg-blue-50   border-blue-200',   text: 'text-blue-800',   dot: '#3b82f6' },
  'Physics':       { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-800', dot: '#7c3aed' },
  'Chemistry':     { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: '#059669' },
  'Biology':       { bg: 'bg-lime-50   border-lime-200',   text: 'text-lime-800',   dot: '#65a30d' },
  'English':       { bg: 'bg-sky-50    border-sky-200',    text: 'text-sky-800',    dot: '#0284c7' },
  'Hindi':         { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', dot: '#ea580c' },
  'Social Studies':{ bg: 'bg-amber-50  border-amber-200',  text: 'text-amber-800',  dot: '#d97706' },
  'Computer Sc.':  { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', dot: '#4f46e5' },
  'Fine Arts':     { bg: 'bg-pink-50   border-pink-200',   text: 'text-pink-800',   dot: '#db2777' },
  'Phys. Ed.':     { bg: 'bg-teal-50   border-teal-200',   text: 'text-teal-800',   dot: '#0d9488' },
}

const defaultColor = { bg: 'bg-surface border-border', text: 'text-text-secondary', dot: '#aaa' }
const getColor = (s) => (s && SUBJECT_COLORS[s]) || defaultColor

function buildEmpty() {
  const t = {}
  DAYS.forEach((d) => { t[d] = Array(8).fill(null) })
  return t
}

export default function Timetable() {
  const [selectedClass, setSelectedClass] = useState(TIMETABLE_CLASSES[0])
  const [timetables, setTimetables] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [teachers, setTeachers] = useState([])
  const [editing, setEditing] = useState(null) // { day, pidx }
  const [editForm, setEditForm] = useState({ subject: '', teacher: '' })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setActionError('')
    setEditing(null)
    getTimetableForClass(selectedClass).then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError(friendlyError(err))
      else setTimetables((prev) => ({ ...prev, [selectedClass]: data }))
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedClass])

  useEffect(() => {
    let cancelled = false
    getTeachers().then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setActionError(friendlyError(err))
      else setTeachers(data || [])
    })
    return () => { cancelled = true }
  }, [])

  const data = timetables[selectedClass] || buildEmpty()

  const gridPeriods = PERIODS.filter((p) => p.id <= 8)
  const contentPeriods = gridPeriods.filter((p) => !p.isBreak)

  const teacherOptions = teachers.map((t) => t.name).filter(Boolean)
  if (editForm.teacher && !teacherOptions.includes(editForm.teacher)) {
    teacherOptions.unshift(editForm.teacher)
  }

  const startEdit = (day, pidx) => {
    const cell = data[day]?.[pidx] || { subject: '', teacher: '' }
    setEditForm({ subject: cell?.s || '', teacher: cell?.t || '' })
    setEditing({ day, pidx })
  }

  const saveEdit = async () => {
    if (!editing) return
    const { day, pidx } = editing
    const subject = editForm.subject || null
    const teacher = editForm.teacher || null
    setActionError('')
    const { error: err } = await saveTimetableCell(selectedClass, day, pidx + 1, subject, teacher)
    if (err) {
      setActionError(friendlyError(err))
      return
    }
    setTimetables((prev) => {
      const cls = prev[selectedClass] ? { ...prev[selectedClass] } : buildEmpty()
      const row = [...(cls[day] || Array(8).fill(null))]
      row[pidx] = subject ? { s: subject, t: teacher } : null
      cls[day] = row
      return { ...prev, [selectedClass]: cls }
    })
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-text">Timetable</h2>
          <p className="mt-1 text-[14.5px] text-text-secondary">View and manage weekly class schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setEditing(null) }}
            className="rounded-xl border border-border bg-surface-card px-4 py-2.5 text-[14px] font-medium text-text focus:border-navy focus:outline-none"
          >
            {TIMETABLE_CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {(actionError || error) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {actionError || error}
        </p>
      )}

      {/* Period header legend */}
      <div className="flex flex-wrap gap-2">
        {contentPeriods.map((p) => (
          <span key={p.id} className="rounded-lg border border-border bg-surface-card px-3 py-1.5 text-[12px] font-medium text-text-secondary">
            <span className="font-semibold text-text">{p.label}</span> · {p.time}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-border bg-surface-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            </div>
          ) : (
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr style={{ background: 'rgba(28,58,40,0.04)' }}>
                <th className="w-[90px] border-b border-r border-border px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
                  Day
                </th>
                {gridPeriods.map((p) => (
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
                  <td className="border-b border-r border-border px-4 py-3 last:border-b-0">
                    <p className="text-[13px] font-semibold text-text">{SHORT_DAYS[di]}</p>
                    <p className="text-[11px] text-text-secondary">{day.slice(3)}</p>
                  </td>
                  {gridPeriods.map((p) => {
                    const pidx = p.id - 1
                    const cell = data[day]?.[pidx]
                    const col = getColor(cell?.s)
                    const isEditing = editing?.day === day && editing?.pidx === pidx
                    return (
                      <td key={p.id} className="border-b border-r border-border p-1.5 last:border-r-0 align-top" style={{ minWidth: 110 }}>
                        {p.isBreak ? (
                          <div className="flex h-[60px] items-center justify-center rounded-md border border-dashed border-border bg-surface px-2 text-center">
                            <span className="text-[11px] font-medium text-text-secondary">{p.label}</span>
                          </div>
                        ) : isEditing ? (
                          <div className="flex flex-col gap-1.5 rounded-lg border border-navy/30 bg-white p-2 shadow-md">
                            <select
                              value={editForm.subject}
                              onChange={(e) => setEditForm((f) => ({ ...f, subject: e.target.value }))}
                              autoFocus
                              className="w-full rounded border border-border bg-surface px-2 py-1 text-[12px] text-text focus:border-navy focus:outline-none"
                            >
                              <option value="">— Free —</option>
                              {ALL_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                            </select>
                            <select
                              value={editForm.teacher}
                              onChange={(e) => setEditForm((f) => ({ ...f, teacher: e.target.value }))}
                              className="w-full rounded border border-border bg-surface px-2 py-1 text-[12px] text-text focus:border-navy focus:outline-none"
                            >
                              <option value="">— None —</option>
                              {teacherOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <div className="flex gap-1">
                              <button onClick={saveEdit} className="flex flex-1 items-center justify-center gap-1 rounded bg-navy py-1 text-[11px] font-semibold text-white hover:bg-navy-deep">
                                <Check size={11} /> Save
                              </button>
                              <button onClick={() => setEditing(null)} className="flex flex-1 items-center justify-center gap-1 rounded border border-border py-1 text-[11px] text-text-secondary hover:bg-surface">
                                <X size={11} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(day, pidx)}
                            className="group relative w-full rounded-lg border p-2 text-left transition-all hover:shadow-sm"
                            style={{ minHeight: 60 }}
                          >
                            {cell ? (
                              <div className={`rounded-md border px-2 py-1.5 ${col.bg}`}>
                                <div className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: col.dot }} />
                                  <p className={`text-[12px] font-semibold truncate ${col.text}`}>{cell.s}</p>
                                </div>
                                <p className="mt-0.5 text-[11px] text-text-secondary truncate pl-3">{cell.t}</p>
                              </div>
                            ) : (
                              <div className="flex h-[52px] items-center justify-center rounded-md border border-dashed border-border">
                                <span className="text-[11px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                  + Add
                                </span>
                              </div>
                            )}
                            <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Pencil size={11} className="text-text-secondary" />
                            </div>
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Break legend */}
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-[12.5px] font-semibold text-text-secondary">Breaks:</p>
        {PERIODS.filter((p) => p.isBreak).map((p) => (
          <span key={p.id} className="text-[12.5px] text-text-secondary">
            <span className="font-semibold text-text">{p.label}</span> — {p.time}
          </span>
        ))}
        <p className="text-[12.5px] text-text-secondary ml-auto">Click any cell to edit · Saturday has 4 periods</p>
      </div>
    </div>
  )
}
