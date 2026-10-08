import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getStudentById } from '../../api/students.js'
import { getExamsForClass, getResultsForStudent } from '../../api/examinations.js'
import { friendlyError } from '../../lib/errors.js'

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

export default function ParentExaminations() {
  const { user } = useAuth()
  const childId = user?.childStudentId

  const [child, setChild] = useState(null)
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(!!childId)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!childId) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      const { data: c, error: err } = await getStudentById(childId)
      if (cancelled) return
      if (err) { setError(friendlyError(err)); setLoading(false); return }
      if (!c) { setError('Linked student record not found. Please contact the school office.'); setLoading(false); return }
      setChild(c)
      const [examRes, resRes] = await Promise.all([
        getExamsForClass(c.className),
        getResultsForStudent(c.studentId),
      ])
      if (cancelled) return
      const errs = [examRes.error, resRes.error].filter(Boolean)
      if (errs.length) setError(errs.map((e) => friendlyError(e)).join(' '))
      setExams(examRes.data || [])
      setResults(resRes.data || [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [childId])

  const resultsByExam = {}
  results.forEach((r) => { if (r.examId) resultsByExam[r.examId] = r })

  const upcoming  = exams.filter((e) => e.status === 'Upcoming')
  const completed = exams.filter((e) => e.status === 'Completed').map((e) => ({ exam: e, result: resultsByExam[e.id] || null }))

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
            <h2 className="text-[20px] font-semibold tracking-tight text-text">Examinations — {child.name}</h2>
            <p className="mt-1 text-[14.5px] text-text-secondary">{child.className} · Section {child.section || '—'}</p>
          </div>

          {/* Upcoming */}
          <div className="rounded-xl border border-border bg-surface-card shadow-card">
            <div className="border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-text">Upcoming Exams</p>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-text-secondary">No upcoming exams scheduled.</p>
            ) : (
              <div className="divide-y divide-border">
                {upcoming.map((e) => {
                  const d = new Date(e.date + 'T00:00:00')
                  const daysLeft = Math.ceil((d - new Date()) / 86400000)
                  return (
                    <div key={e.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                        <span className="text-[13px] font-bold leading-none">{d.getDate()}</span>
                        <span className="text-[10px] font-medium">{d.toLocaleString('en-IN', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-text">{e.subject}</p>
                        <p className="text-[12.5px] text-text-secondary">{e.type} · {fmtDate(e.date)} · {e.time || '—'} · Room {e.room || '—'} · Max {e.maxMarks} marks</p>
                      </div>
                      <span className={`text-[12.5px] font-semibold ${daysLeft <= 3 ? 'text-rose-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-text-secondary'}`}>
                        {daysLeft > 0 ? `${daysLeft} days` : 'Today'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="rounded-xl border border-border bg-surface-card shadow-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-text">Results</p>
            </div>
            {completed.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-text-secondary">No results available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface/60">
                      {['Subject','Type','Date','Marks','Grade'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map(({ exam: e, result: r }) => {
                      const marks    = r?.marks
                      const hasMarks = marks != null && e.maxMarks > 0
                      const pct      = hasMarks ? Math.round((marks / e.maxMarks) * 100) : 0
                      const grade    = r?.grade || (hasMarks ? gradeFromPct(pct) : '—')
                      const gradeCol = !hasMarks ? 'text-text-secondary' : pct >= 35 ? 'text-emerald-600' : 'text-rose-600'
                      return (
                        <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface/40">
                          <td className="px-4 py-3 text-[14px] font-medium text-text">{e.subject}</td>
                          <td className="px-4 py-3 text-[13px] text-text-secondary">{e.type}</td>
                          <td className="px-4 py-3 text-[13px] text-text-secondary">{fmtDate(e.date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold text-text">{hasMarks ? `${marks}/${e.maxMarks}` : '—'}</span>
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 60 ? '#059669' : pct >= 35 ? '#d97706' : '#e11d48' }} />
                              </div>
                              <span className="text-[12px] text-text-secondary">{hasMarks ? `${pct}%` : '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[14px] font-bold ${gradeCol}`}>{grade}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
