import { useMemo, useState } from 'react'
import {
  ClipboardCheck, UserCheck, UserX, Clock, ChevronLeft, ChevronRight, Save,
} from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { SEED_STUDENTS, CLASS_OPTIONS } from '../../data/students.js'

const STATUS = { P: 'Present', A: 'Absent', L: 'Late' }
const STATUS_STYLE = {
  P: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', btn: 'bg-emerald-600 text-white border-emerald-600 shadow-sm' },
  A: { pill: 'bg-rose-50 text-rose-700 border-rose-200',          btn: 'bg-rose-600 text-white border-rose-600 shadow-sm' },
  L: { pill: 'bg-amber-50 text-amber-700 border-amber-200',       btn: 'bg-amber-500 text-white border-amber-500 shadow-sm' },
}

const todayISO = () => new Date().toISOString().split('T')[0]

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState(CLASS_OPTIONS[0])
  const [date, setDate] = useState(todayISO())
  const [records, setRecords] = useState({})    // key: `${date}__${className}__${studentId}` → 'P'|'A'|'L'
  const [saved, setSaved] = useState({})        // key: `${date}__${className}` → true

  const classKey = `${date}__${selectedClass}`

  const students = useMemo(
    () => SEED_STUDENTS.filter((s) => s.className === selectedClass),
    [selectedClass]
  )

  const getStatus = (studentId) => records[`${classKey}__${studentId}`] || 'P'
  const setStatus = (studentId, val) =>
    setRecords((r) => ({ ...r, [`${classKey}__${studentId}`]: val }))

  const markAll = (val) => {
    const next = { ...records }
    students.forEach((s) => { next[`${classKey}__${s.studentId}`] = val })
    setRecords(next)
  }

  const handleSave = () => {
    setSaved((s) => ({ ...s, [classKey]: true }))
  }

  const counts = useMemo(() => {
    const base = { P: 0, A: 0, L: 0 }
    students.forEach((s) => {
      const st = getStatus(s.studentId)
      base[st] = (base[st] || 0) + 1
    })
    return base
  }, [records, students, classKey])

  const rate = students.length > 0
    ? Math.round(((counts.P + counts.L) / students.length) * 100)
    : 0

  const isSaved = saved[classKey]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Attendance</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Mark and track daily student attendance by class</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() - 1)
            setDate(d.toISOString().split('T')[0])
          }} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text transition-colors">
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayISO()}
            className="rounded-lg border border-border bg-surface-card px-3 py-2 text-[14px] text-text focus:border-navy focus:outline-none"
          />
          <button onClick={() => {
            const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + 1)
            const next = d.toISOString().split('T')[0]
            if (next <= todayISO()) setDate(next)
          }} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text transition-colors disabled:opacity-40"
            disabled={date >= todayISO()}>
            <ChevronRight size={16} />
          </button>
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:border-navy focus:outline-none sm:w-44"
        >
          {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <p className="text-[13.5px] text-text-secondary sm:ml-auto">{fmtDate(date)}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Students"  value={students.length} sub={`In ${selectedClass}`}    icon={ClipboardCheck} tone="navy" />
        <StatCard label="Present"         value={counts.P}        sub={`${rate}% attendance`}    icon={UserCheck}      tone="emerald" />
        <StatCard label="Absent"          value={counts.A}        sub="Marked absent today"      icon={UserX}          tone="rose" />
        <StatCard label="Late"            value={counts.L}        sub="Arrived late"             icon={Clock}          tone="gold" />
      </div>

      {/* Attendance sheet */}
      <div className="rounded-xl border border-border bg-surface-card shadow-card">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-text">{selectedClass} — Attendance Sheet</p>
            <p className="text-[13px] text-text-secondary mt-0.5">{students.length} students</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-text-secondary">Mark all:</span>
            {Object.entries(STATUS).map(([key, label]) => (
              <button key={key} onClick={() => markAll(key)}
                className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition-colors hover:opacity-90 ${STATUS_STYLE[key].btn}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {students.length === 0 ? (
          <div className="py-14 text-center text-[14px] text-text-secondary">
            No students enrolled in {selectedClass}.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {students.map((s, i) => {
              const st = getStatus(s.studentId)
              return (
                <div key={s.studentId}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface/50 transition-colors">
                  <span className="w-6 shrink-0 text-[13px] text-text-secondary">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-text truncate">{s.name}</p>
                    <p className="text-[12px] text-text-secondary">{s.studentId} · {s.section && `Sec ${s.section}`}</p>
                  </div>
                  {/* Toggle buttons */}
                  <div className="flex items-center gap-1.5">
                    {Object.entries(STATUS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setStatus(s.studentId, key)}
                        className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-150 ${
                          st === key
                            ? STATUS_STYLE[key].btn
                            : 'border-border bg-surface-card text-text-secondary hover:border-[#C6D0DB] hover:text-text'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Status pill */}
                  <span className={`hidden sm:inline-flex shrink-0 w-[80px] items-center justify-center rounded-full border py-0.5 text-[12px] font-semibold ${STATUS_STYLE[st].pill}`}>
                    {STATUS[st]}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer save */}
        {students.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <p className="text-[13.5px] text-text-secondary">
              {isSaved
                ? '✓ Attendance saved for this session'
                : 'Review and save attendance for the day'}
            </p>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm hover:bg-navy-deep transition-colors"
            >
              <Save size={15} />
              {isSaved ? 'Update' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>

      {/* Summary bar */}
      {students.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-card px-5 py-4 shadow-card">
          <p className="mb-3 text-[13.5px] font-semibold text-text">Attendance Rate</p>
          <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${rate}%`,
                background: rate >= 90 ? '#059669' : rate >= 75 ? '#d97706' : '#e11d48',
              }}
            />
          </div>
          <div className="flex justify-between text-[12.5px] text-text-secondary">
            <span>{rate}% present + late</span>
            <span>{counts.P + counts.L} of {students.length} students</span>
          </div>
        </div>
      )}
    </div>
  )
}
