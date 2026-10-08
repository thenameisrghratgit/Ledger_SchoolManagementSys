import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, UserCheck, UserX, Clock, Save, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { CLASS_OPTIONS } from '../../data/students.js'
import { getTeacherById } from '../../api/teachers.js'
import { getStudents } from '../../api/students.js'
import { getAttendanceForClass, saveAttendanceBatch } from '../../api/attendance.js'
import { friendlyError } from '../../lib/errors.js'

const STATUS = { P: 'Present', A: 'Absent', L: 'Late' }
const STATUS_STYLE = {
  P: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', btn: 'bg-emerald-600 text-white border-emerald-600' },
  A: { pill: 'bg-rose-50 text-rose-700 border-rose-200',          btn: 'bg-rose-600 text-white border-rose-600' },
  L: { pill: 'bg-amber-50 text-amber-700 border-amber-200',       btn: 'bg-amber-500 text-white border-amber-500' },
}

function fmtLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const todayISO = () => fmtLocal(new Date())

function classesForTeacher(t) {
  const raw = String(t?.classes || '')
  const range = raw.match(/(\d+)\s*[–—-]\s*(\d+)/)
  const nums = range ? [] : (raw.match(/\d+/g) || []).map(Number)
  const wanted = (n) => {
    if (!range) return nums.includes(n)
    const lo = Math.min(Number(range[1]), Number(range[2]))
    const hi = Math.max(Number(range[1]), Number(range[2]))
    return n >= lo && n <= hi
  }
  return CLASS_OPTIONS.filter((c) => wanted(Number(c.replace('Class ', ''))))
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TeacherAttendance() {
  const { user } = useAuth()
  const [classes, setClasses] = useState(CLASS_OPTIONS)
  const [selectedClass, setSelectedClass] = useState(CLASS_OPTIONS[0])
  const [date, setDate] = useState(todayISO())
  const [records, setRecords] = useState({})
  const [saved, setSaved] = useState({})
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)

  const classKey = `${date}__${selectedClass}`

  useEffect(() => {
    let cancelled = false
    async function load() {
      const tid = user?.teacherId
      let t = user?.teacher || null
      if (!t && tid) {
        const { data, error: err } = await getTeacherById(tid)
        if (cancelled) return
        if (err) { setError(friendlyError(err)); setLoading(false); return }
        t = data
      }
      if (cancelled) return
      if (!t) {
        setLoadError('Your teacher record is missing. Please contact your administrator.')
        setLoading(false)
        return
      }
      const allowed = classesForTeacher(t)
      setClasses(allowed)
      setSelectedClass((prev) => (allowed.includes(prev) ? prev : allowed[0] || ''))
      const { data, error: sErr } = await getStudents()
      if (cancelled) return
      if (sErr) setLoadError(friendlyError(sErr))
      else setAllStudents(data || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user?.teacherId, user?.teacher])

  useEffect(() => {
    if (!selectedClass) return undefined
    let cancelled = false
    setError('')
    getAttendanceForClass(selectedClass, date).then(({ data, error: err }) => {
      if (cancelled) return
      if (err) { setError(friendlyError(err)); return }
      const rows = data || []
      setRecords((prev) => {
        const next = {}
        Object.entries(prev).forEach(([k, v]) => { if (!k.startsWith(`${classKey}__`)) next[k] = v })
        rows.forEach((r) => { next[`${classKey}__${r.studentId}`] = r.status })
        return next
      })
    })
    return () => { cancelled = true }
  }, [classKey])

  const students = useMemo(() => allStudents.filter((s) => s.className === selectedClass), [allStudents, selectedClass])
  const getStatus = (sid) => records[`${classKey}__${sid}`] || 'P'
  const setStatus = (sid, val) => {
    setRecords((r) => ({ ...r, [`${classKey}__${sid}`]: val }))
    setSaved((s) => ({ ...s, [classKey]: false }))
  }
  const markAll = (val) => {
    const next = { ...records }
    students.forEach((s) => { next[`${classKey}__${s.studentId}`] = val })
    setRecords(next)
    setSaved((s) => ({ ...s, [classKey]: false }))
  }

  const handleSave = async () => {
    if (students.length === 0 || saving) return
    setError('')
    setSaving(true)
    const payload = students.map((s) => ({
      studentId: s.studentId,
      date,
      status: getStatus(s.studentId),
      markedBy: user?.id,
    }))
    const { error: err } = await saveAttendanceBatch(payload)
    setSaving(false)
    if (err) {
      setError(friendlyError(err))
      setSaved((s) => ({ ...s, [classKey]: false }))
      return
    }
    setSaved((s) => ({ ...s, [classKey]: true }))
  }

  const counts = useMemo(() => {
    const b = { P: 0, A: 0, L: 0 }
    students.forEach((s) => {
      const k = getStatus(s.studentId)
      if (b[k] !== undefined) b[k]++
    })
    return b
  }, [records, students, classKey])
  const rate = students.length > 0 ? Math.round(((counts.P + counts.L) / students.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Mark Attendance</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Record attendance for your assigned classes</p>
      </div>

      {(loadError || error) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {loadError || error}
        </p>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() - 1); setDate(fmtLocal(d)) }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text transition-colors">
            <ChevronLeft size={16} />
          </button>
          <input type="date" value={date} onChange={(e) => { if (e.target.value) setDate(e.target.value) }} max={todayISO()}
            className="rounded-lg border border-border bg-surface-card px-3 py-2 text-[14px] text-text focus:border-navy focus:outline-none" />
          <button onClick={() => { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + 1); const n = fmtLocal(d); if (n <= todayISO()) setDate(n) }}
            disabled={date >= todayISO()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface transition-colors disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text focus:border-navy focus:outline-none sm:w-44">
          {classes.map((c) => <option key={c}>{c}</option>)}
        </select>
        <p className="text-[13.5px] text-text-secondary sm:ml-auto">{fmtDate(date)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total"   value={students.length} sub={`In ${selectedClass}`} icon={ClipboardCheck} tone="navy" />
        <StatCard label="Present" value={counts.P}        sub={`${rate}% rate`}       icon={UserCheck}      tone="emerald" />
        <StatCard label="Absent"  value={counts.A}        sub="Marked absent"         icon={UserX}          tone="rose" />
        <StatCard label="Late"    value={counts.L}        sub="Late arrivals"         icon={Clock}          tone="gold" />
      </div>

      <div className="rounded-xl border border-border bg-surface-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-text">{selectedClass} — {fmtDate(date)}</p>
            <p className="text-[13px] text-text-secondary mt-0.5">{students.length} students</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-text-secondary">Mark all:</span>
            {Object.entries(STATUS).map(([key, label]) => (
              <button key={key} onClick={() => markAll(key)}
                className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold ${STATUS_STYLE[key].btn}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          </div>
        ) : loadError ? null : classes.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-text-secondary">No classes assigned to you.</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-text-secondary">No students in {selectedClass}.</div>
        ) : (
          <div className="divide-y divide-border">
            {students.map((s, i) => {
              const st = getStatus(s.studentId)
              return (
                <div key={s.studentId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface/50">
                  <span className="w-6 shrink-0 text-[13px] text-text-secondary">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-text truncate">{s.name}</p>
                    <p className="text-[12px] text-text-secondary">{s.studentId}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Object.entries(STATUS).map(([key, label]) => (
                      <button key={key} onClick={() => setStatus(s.studentId, key)}
                        className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition-all ${
                          st === key ? STATUS_STYLE[key].btn : 'border-border bg-surface-card text-text-secondary hover:border-[#C6D0DB]'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <span className={`hidden sm:inline-flex w-[74px] shrink-0 items-center justify-center rounded-full border py-0.5 text-[12px] font-semibold ${STATUS_STYLE[st].pill}`}>
                    {STATUS[st]}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {students.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <p className="text-[13.5px] text-text-secondary">
              {saved[classKey] ? '✓ Saved for this session' : 'Review and save attendance'}
            </p>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-colors disabled:opacity-60"
              style={{ background: '#C4622D' }}>
              <Save size={15} /> {saved[classKey] ? 'Update' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-card px-5 py-4 shadow-card">
          <p className="mb-2 text-[13.5px] font-semibold text-text">Attendance Rate</p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${rate}%`, background: rate >= 90 ? '#059669' : rate >= 75 ? '#d97706' : '#e11d48' }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[12.5px] text-text-secondary">
            <span>{rate}% present + late</span>
            <span>{counts.P + counts.L} of {students.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}