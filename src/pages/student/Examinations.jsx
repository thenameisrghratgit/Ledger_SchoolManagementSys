import { FileText, CalendarDays, CheckCircle2, Award } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_STUDENTS } from '../../data/students.js'
import { SEED_EXAMS } from '../../data/examinations.js'

// Demo results for completed exams
const DEMO_RESULTS = {
  'EX-006': { marks: 22, maxMarks: 25, grade: 'A' },
  'EX-007': { marks: 19, maxMarks: 25, grade: 'B+' },
  'EX-008': { marks: 41, maxMarks: 50, grade: 'A' },
}

function gradeColor(grade) {
  if (!grade) return ''
  if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (grade.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (grade.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function StudentExaminations() {
  const { user } = useAuth()
  const studentId = user?.studentId || 'STU-2026-0142'
  const student = SEED_STUDENTS.find((s) => s.studentId === studentId) || SEED_STUDENTS[0]

  const myExams    = SEED_EXAMS.filter((e) => e.className === student.className)
  const upcoming   = myExams.filter((e) => e.status === 'Upcoming').sort((a, b) => a.date.localeCompare(b.date))
  const completed  = myExams.filter((e) => e.status === 'Completed')

  const resultsAvail = completed.filter((e) => DEMO_RESULTS[e.id])
  const avgScore = resultsAvail.length > 0
    ? Math.round(resultsAvail.reduce((s, e) => s + (DEMO_RESULTS[e.id].marks / DEMO_RESULTS[e.id].maxMarks) * 100, 0) / resultsAvail.length)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Examinations</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">{student.className} – upcoming schedules and past results</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Exams"    value={myExams.length}    sub="In your class"     icon={FileText}    tone="navy" />
        <StatCard label="Upcoming"       value={upcoming.length}   sub="Scheduled ahead"   icon={CalendarDays} tone="gold" />
        <StatCard label="Completed"      value={completed.length}  sub="Results available" icon={CheckCircle2} tone="emerald" />
        <StatCard label="Avg Score"      value={`${avgScore}%`}    sub="Across results"    icon={Award}        tone="rose" />
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <p className="text-[15px] font-semibold text-text">Upcoming Exams</p>
          </div>
          <div className="divide-y divide-border">
            {upcoming.map((e) => {
              const d = new Date(e.date + 'T00:00:00')
              const daysLeft = Math.ceil((d - new Date()) / 86400000)
              return (
                <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface/50">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-navy/[0.07] text-navy">
                    <span className="text-[14px] font-bold leading-none">{d.getDate()}</span>
                    <span className="text-[10px] font-medium">{d.toLocaleString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-text">{e.subject}</p>
                    <p className="text-[12.5px] text-text-secondary">{e.type} · {e.time} · {e.room} · Max {e.maxMarks} marks</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[12px] font-semibold ${daysLeft <= 3 ? 'text-rose-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-text-secondary'}`}>
                      {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {completed.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <p className="text-[15px] font-semibold text-text">Results</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['Subject', 'Exam Type', 'Date', 'Max Marks', 'Obtained', 'Grade', 'Performance'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completed.map((e) => {
                  const r = DEMO_RESULTS[e.id]
                  const pct = r ? Math.round((r.marks / r.maxMarks) * 100) : null
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                      <td className="px-4 py-3.5 text-[14px] font-medium text-text">{e.subject}</td>
                      <td className="px-4 py-3.5"><span className="rounded-md bg-navy/[0.06] px-2 py-0.5 text-[11.5px] font-medium text-navy">{e.type}</span></td>
                      <td className="px-4 py-3.5 text-[13.5px] text-text-secondary">{fmtDate(e.date)}</td>
                      <td className="px-4 py-3.5 text-[13.5px] text-text text-center">{e.maxMarks}</td>
                      <td className="px-4 py-3.5 text-[14px] font-semibold text-text text-center">{r ? r.marks : '—'}</td>
                      <td className="px-4 py-3.5">
                        {r ? (
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${gradeColor(r.grade)}`}>{r.grade}</span>
                        ) : <span className="text-text-secondary">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {pct !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#f43f5e' }} />
                            </div>
                            <span className="text-[12px] text-text-secondary">{pct}%</span>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
