import { useEffect, useState } from 'react'
import { FileText, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTeacherById } from '../../api/teachers.js'
import { getStudents } from '../../api/students.js'
import { getExams, getResultsForExam, upsertResult } from '../../api/examinations.js'
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

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function gradeFromPct(pct) {
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 35) return 'D'
  return 'F'
}

export default function TeacherExaminations() {
  const { user } = useAuth()

  const [teacher, setTeacher] = useState(null)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [selectedExam, setSelectedExam] = useState(null)
  const [examStudents, setExamStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [examLoading, setExamLoading] = useState(false)
  const [marksError, setMarksError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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
      const { data: ex, error: err } = await getExams()
      if (cancelled) return
      if (err) setError(friendlyError(err))
      else setExams(ex || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user?.teacherId, user?.teacher])

  const myExams = exams.filter((e) =>
    teacher?.subjects.some((s) => e.subject.includes(s.split(' ')[0]))
  )
  const upcoming  = myExams.filter((e) => e.status === 'Upcoming')
  const completed = myExams.filter((e) => e.status === 'Completed')

  const handleSelectExam = async (e) => {
    setSelectedExam(e)
    setSaved(false)
    setActionError('')
    setMarksError('')
    setMarks({})
    setExamStudents([])
    setExamLoading(true)
    const [{ data: students, error: sErr }, { data: results, error: rErr }] = await Promise.all([
      getStudents(),
      getResultsForExam(e.id),
    ])
    setExamLoading(false)
    if (sErr) { setActionError(friendlyError(sErr)); return }
    if (rErr) { setActionError(friendlyError(rErr)); return }
    setExamStudents((students || []).filter((s) => s.className === e.className))
    const m = {}
    ;(results || []).forEach((r) => { m[`${e.id}__${r.studentId}`] = r.marks })
    setMarks(m)
  }

  const handleSave = async () => {
    if (!selectedExam || saving) return
    setActionError('')
    setMarksError('')
    const maxMarks = Number(selectedExam.maxMarks) || 0
    for (const s of examStudents) {
      const raw = marks[`${selectedExam.id}__${s.studentId}`]
      if (raw === '' || raw === undefined || raw === null) continue
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0 || n > maxMarks) {
        setMarksError(`Marks for ${s.name} must be a number between 0 and ${maxMarks}.`)
        setSaved(false)
        return
      }
    }
    setSaved(false)
    setSaving(true)
    let firstError = null
    for (const s of examStudents) {
      const raw = marks[`${selectedExam.id}__${s.studentId}`]
      if (raw === '' || raw === undefined || raw === null) continue
      const { error: err } = await upsertResult({
        examId: selectedExam.id,
        studentId: s.studentId,
        marks: Number(raw),
      })
      if (err) { firstError = err; break }
    }
    if (firstError) {
      setActionError(friendlyError(firstError))
      setSaved(false)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Examinations</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Your assigned exams and result entry</p>
      </div>

      {(error || actionError || marksError) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error || actionError || marksError}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <div className="rounded-xl border border-border bg-surface-card shadow-card">
            <div className="border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-text">Upcoming — Your Subjects</p>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-text-secondary">No upcoming exams for your subjects.</p>
            ) : (
              <div className="divide-y divide-border">
                {upcoming.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface/50">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gold/[0.1] text-gold-600">
                      <span className="text-[13px] font-bold leading-none">{new Date(e.date + 'T00:00:00').getDate()}</span>
                      <span className="text-[10px] font-medium">{new Date(e.date + 'T00:00:00').toLocaleString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-text">{e.subject} — {e.className}</p>
                      <p className="text-[12.5px] text-text-secondary">{e.type} · {fmtDate(e.date)} · {e.room || '—'} · Max {e.maxMarks} marks</p>
                    </div>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[12px] font-semibold text-amber-700">Upcoming</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results entry */}
          <div className="rounded-xl border border-border bg-surface-card shadow-card">
            <div className="border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-text">Enter Results</p>
              <p className="text-[13px] text-text-secondary mt-0.5">Select a completed exam to enter marks</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2 mb-5">
                {completed.map((e) => (
                  <button key={e.id} onClick={() => handleSelectExam(e)}
                    className={`rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all ${
                      selectedExam?.id === e.id
                        ? 'border-navy bg-navy text-white'
                        : 'border-border bg-surface-card text-text hover:border-navy/40'
                    }`}>
                    {e.subject} — {e.className}
                  </button>
                ))}
                {completed.length === 0 && <p className="text-[14px] text-text-secondary">No completed exams to enter results for.</p>}
              </div>

              {selectedExam && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-text">{selectedExam.subject} — {selectedExam.className}</p>
                      <p className="text-[12.5px] text-text-secondary">{selectedExam.type} · {fmtDate(selectedExam.date)} · Max {selectedExam.maxMarks} marks</p>
                    </div>
                    {saved && (
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                        <Check size={14} /> Results saved
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    {examLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                      </div>
                    ) : examStudents.length === 0 ? (
                      <div className="py-10 text-center text-[14px] text-text-secondary">No students in {selectedExam.className}.</div>
                    ) : (
                      <table className="w-full min-w-[480px] border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-surface/60">
                            <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">Student</th>
                            <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">ID</th>
                            <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-text-secondary">Marks / {selectedExam.maxMarks}</th>
                            <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-text-secondary">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examStudents.map((s) => {
                            const m = marks[`${selectedExam.id}__${s.studentId}`] ?? ''
                            const maxMarks = Number(selectedExam.maxMarks) || 0
                            const n = m === '' ? NaN : Number(m)
                            const pct = m !== '' && Number.isFinite(n) && maxMarks > 0 ? Math.round((n / maxMarks) * 100) : null
                            const grade = pct !== null ? gradeFromPct(pct) : '—'
                            return (
                              <tr key={s.studentId} className="border-b border-border last:border-0 hover:bg-surface/40">
                                <td className="px-4 py-3 text-[14px] text-text">{s.name}</td>
                                <td className="px-4 py-3 text-[12.5px] text-text-secondary">{s.studentId}</td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="number"
                                    value={m}
                                    onChange={(e) => {
                                      setMarks((r) => ({ ...r, [`${selectedExam.id}__${s.studentId}`]: e.target.value }))
                                      setSaved(false)
                                      setMarksError('')
                                    }}
                                    min={0} max={selectedExam.maxMarks}
                                    placeholder="—"
                                    className="w-20 rounded-lg border border-border bg-surface-card px-2 py-1.5 text-center text-[14px] text-text focus:border-navy focus:outline-none"
                                  />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-[13px] font-bold ${pct !== null && pct >= 35 ? 'text-emerald-600' : pct !== null ? 'text-rose-600' : 'text-text-secondary'}`}>
                                    {grade}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button onClick={handleSave} disabled={saving || examStudents.length === 0}
                      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm disabled:opacity-60"
                      style={{ background: '#C4622D' }}>
                      <FileText size={14} /> Save Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}