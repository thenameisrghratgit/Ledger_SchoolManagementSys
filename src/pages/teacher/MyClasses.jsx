import { useEffect, useState } from 'react'
import { Users, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { CLASS_OPTIONS } from '../../data/students.js'
import { DAYS, SHORT_DAYS, PERIODS } from '../../data/timetable.js'
import { getTeacherById } from '../../api/teachers.js'
import { getStudents } from '../../api/students.js'
import { getTimetableForClass } from '../../api/timetable.js'
import { friendlyError } from '../../lib/errors.js'

function normalizeTeacher(t) {
  if (!t) return null
  return {
    teacherId: t.teacherId ?? t.teacher_id,
    authId: t.authId ?? t.auth_id,
    name: t.name,
    department: t.department,
    qualification: t.qualification,
    subjects: Array.isArray(t.subjects) ? t.subjects : [],
    contact: t.contact,
    email: t.email,
    experience: t.experience ? String(t.experience) : '',
    classes: t.classes,
    status: t.status,
  }
}

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

export default function TeacherMyClasses() {
  const { user } = useAuth()

  const [teacher, setTeacher] = useState(null)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [timetable, setTimetable] = useState({})
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const tid = user?.teacherId
      if (!tid) { setError('Your teacher record is missing. Please contact your administrator.'); setLoading(false); return }
      let t = user?.teacher ? normalizeTeacher(user.teacher) : null
      if (!t) {
        const { data, error: err } = await getTeacherById(tid)
        if (cancelled) return
        if (err) { setError(friendlyError(err)); setLoading(false); return }
        t = data
      }
      if (cancelled) return
      if (!t) { setError('Teacher profile not found. Please contact your administrator.'); setLoading(false); return }
      setTeacher(t)
      const myClasses = classesForTeacher(t)
      setClasses(myClasses)
      setSelectedClass((prev) => (myClasses.includes(prev) ? prev : myClasses[0] || ''))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user?.teacherId, user?.teacher])

  useEffect(() => {
    if (!selectedClass) return undefined
    let cancelled = false
    setDataLoading(true)
    Promise.all([getTimetableForClass(selectedClass), getStudents()]).then(([{ data: tt, error: ttErr }, { data: st, error: stErr }]) => {
      if (cancelled) return
      if (ttErr) setError(friendlyError(ttErr))
      else if (stErr) setError(friendlyError(stErr))
      else {
        setError('')
        setTimetable(tt || {})
        setRoster((st || []).filter((s) => s.className === selectedClass))
      }
      setDataLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedClass])

  const contentPeriods = PERIODS.filter((p) => !p.isBreak)
  let ci = 0; const pidxMap = {}
  PERIODS.forEach((p) => { if (!p.isBreak) { pidxMap[p.id] = ci; ci++ } })

  // Only highlight cells belonging to this teacher
  const isMyCell = (cell) => cell && cell.s && teacher?.subjects.some((s) => cell.s.includes(s.split(' ')[0]))

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-text">My Classes</h2>
          <p className="mt-1 text-[14.5px] text-text-secondary">Weekly timetable — your assigned periods are highlighted</p>
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-xl border border-border bg-surface-card px-4 py-2.5 text-[14px] font-medium text-text focus:border-navy focus:outline-none">
          {classes.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              {dataLoading ? (
                <div className="flex items-center justify-center py-14">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                </div>
              ) : classes.length === 0 ? (
                <p className="py-14 text-center text-[14px] text-text-secondary">No classes assigned to you.</p>
              ) : (
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
                          const cell = timetable[day]?.[pidxMap[p.id]]
                          const mine = isMyCell(cell)
                          const col = mine ? getCol(cell.s) : defaultCol
                          return (
                            <td key={p.id} className="border-b border-r border-border p-1.5 last:border-r-0" style={{ minWidth: 100 }}>
                              {cell ? (
                                <div className={`rounded-md border px-2 py-1.5 ${mine ? col.bg : 'bg-surface/50 border-border/50 opacity-40'}`} style={{ minHeight: 52 }}>
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: mine ? col.dot : '#aaa' }} />
                                    <p className={`text-[12px] font-semibold truncate ${mine ? col.text : 'text-text-secondary'}`}>{cell.s || '—'}</p>
                                  </div>
                                  <p className="mt-0.5 text-[11px] text-text-secondary truncate pl-3">{cell.t || '—'}</p>
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
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[12.5px] text-text-secondary">
            <span className="h-3 w-3 rounded-sm bg-violet-100 border border-violet-200" /> Your periods highlighted · other periods dimmed
          </div>

          {/* Class roster */}
          {selectedClass && (
          <div className="rounded-xl border border-border bg-surface-card shadow-card">
            <div className="border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-text">{selectedClass} — Roster</p>
              <p className="text-[13px] text-text-secondary mt-0.5">{roster.length} students</p>
            </div>
            {roster.length === 0 ? (
              <div className="py-10 text-center text-[14px] text-text-secondary">No students in {selectedClass}.</div>
            ) : (
              <div className="divide-y divide-border">
                {roster.map((s, i) => (
                  <div key={s.studentId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface/50">
                    <span className="w-6 shrink-0 text-[13px] text-text-secondary">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-text truncate">{s.name}</p>
                      <p className="text-[12px] text-text-secondary">{s.studentId} · {s.section ? `Sec ${s.section}` : ''}</p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
                      <Users size={13} /> {s.rollNumber ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </>
      )}
    </div>
  )
}