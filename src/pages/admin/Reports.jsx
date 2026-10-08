import { useEffect, useState } from 'react'
import {
  BarChart3, Users, ClipboardCheck, Wallet, FileText,
  Download, RefreshCw, CheckCircle2, Clock, Eye, AlertCircle,
} from 'lucide-react'
import { getStudents } from '../../api/students.js'
import { getFees } from '../../api/fees.js'
import { getExams, getAllResults } from '../../api/examinations.js'
import { getAttendanceForClass } from '../../api/attendance.js'
import { friendlyError } from '../../lib/errors.js'

const REPORT_TYPES = [
  {
    id: 'enrollment',
    label: 'Enrollment Report',
    description: 'Total students by class, gender breakdown, new admissions this term.',
    icon: Users,
    tone: 'navy',
  },
  {
    id: 'attendance',
    label: 'Attendance Report',
    description: 'Class-wise attendance rates, chronic absentees, monthly trends.',
    icon: ClipboardCheck,
    tone: 'emerald',
  },
  {
    id: 'fees',
    label: 'Fee Collection Report',
    description: 'Collection summary, outstanding dues, overdue accounts, payment trends.',
    icon: Wallet,
    tone: 'gold',
  },
  {
    id: 'examinations',
    label: 'Examination Results',
    description: 'Subject-wise pass rates, toppers, grade distribution, class performance.',
    icon: FileText,
    tone: 'rose',
  },
]

const TONE_STYLES = {
  navy:    { icon: 'bg-navy/[0.07] text-navy',         bar: '#1C3A28' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600',   bar: '#059669' },
  gold:    { icon: 'bg-gold/[0.12] text-gold-600',     bar: '#C4622D' },
  rose:    { icon: 'bg-rose-50 text-rose-500',         bar: '#f43f5e' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtINR(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function csvText(headers, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return blob.size
}

async function fetchAttendance(classes, date) {
  let present = 0
  let total = 0
  const rows = []
  for (const cls of classes) {
    const { data, error } = await getAttendanceForClass(cls, date)
    if (error) return { error }
    ;(data || []).forEach((r) => {
      rows.push({ date: r.date, className: cls, studentId: r.studentId, studentName: r.studentName || '', status: r.status })
      total += 1
      if (r.status === 'Present') present += 1
    })
  }
  return { rows, present, total }
}

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [students, setStudents] = useState([])
  const [fees, setFees] = useState([])
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [generating, setGenerating] = useState({})
  const [generated, setGenerated] = useState({})
  const [recent, setRecent] = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [stuRes, feeRes, examRes, resRes] = await Promise.all([
        getStudents(), getFees(), getExams(), getAllResults(),
      ])
      if (cancelled) return
      const failed = [stuRes, feeRes, examRes, resRes].find((r) => r.error)
      if (failed) {
        setError(friendlyError(failed.error))
        setLoading(false)
        return
      }
      const stu = stuRes.data || []
      setStudents(stu)
      setFees(feeRes.data || [])
      setExams(examRes.data || [])
      setResults(resRes.data || [])
      const classes = [...new Set(stu.map((s) => s.className).filter(Boolean))]
      const att = await fetchAttendance(classes, todayISO())
      if (cancelled) return
      if (att.error) setError(friendlyError(att.error))
      else setAttendance(att)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const classCount = new Set(students.map((s) => s.className).filter(Boolean)).size
  const maleCount = students.filter((s) => s.gender === 'Male').length
  const femaleCount = students.filter((s) => s.gender === 'Female').length
  const collected = fees.filter((f) => f.status === 'Paid').reduce((s, f) => s + Number(f.amount || 0), 0)
  const pendingSum = fees.filter((f) => f.status === 'Pending').reduce((s, f) => s + Number(f.amount || 0), 0)
  const overdueSum = fees.filter((f) => f.status === 'Overdue').reduce((s, f) => s + Number(f.amount || 0), 0)
  const scored = results.filter((r) => r.marks !== null && r.marks !== undefined && r.exam && r.exam.maxMarks)
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, r) => s + (r.marks / r.exam.maxMarks) * 100, 0) / scored.length)
    : null

  const reportStats = {
    enrollment: [
      { label: 'Total Students', value: loading ? '—' : students.length },
      { label: 'Class Levels', value: loading ? '—' : classCount },
      { label: 'Boys / Girls', value: loading ? '—' : `${maleCount} / ${femaleCount}` },
    ],
    attendance: [
      { label: 'Present Today', value: loading ? '—' : attendance ? attendance.present : '—' },
      { label: 'Records Today', value: loading ? '—' : attendance ? attendance.total : '—' },
      { label: 'Rate Today', value: loading ? '—' : attendance && attendance.total > 0 ? `${Math.round((attendance.present / attendance.total) * 100)}%` : 'N/A' },
    ],
    fees: [
      { label: 'Collected (All Fees)', value: loading ? '—' : fmtINR(collected) },
      { label: 'Pending (All Fees)', value: loading ? '—' : fmtINR(pendingSum) },
      { label: 'Overdue (All Fees)', value: loading ? '—' : fmtINR(overdueSum) },
    ],
    examinations: [
      { label: 'Exams On Record', value: loading ? '—' : exams.length },
      { label: 'Results On Record', value: loading ? '—' : results.length },
      { label: 'Avg Score (All Results)', value: loading ? '—' : avgScore !== null ? `${avgScore}%` : 'N/A' },
    ],
  }

  const generate = async (id, label) => {
    setActionError('')
    setGenerating((g) => ({ ...g, [id]: true }))
    try {
      const day = todayISO()
      let headers = []
      let rows = []

      if (id === 'enrollment') {
        const { data, error: err } = await getStudents()
        if (err) throw err
        headers = ['Student ID', 'Name', 'Class', 'Section', 'Gender', 'Status']
        rows = (data || []).map((s) => [s.studentId, s.name, s.className, s.section, s.gender, s.status])
      } else if (id === 'attendance') {
        const classes = [...new Set(students.map((s) => s.className).filter(Boolean))]
        const att = await fetchAttendance(classes, day)
        if (att.error) throw att.error
        setAttendance(att)
        headers = ['Date', 'Class', 'Student ID', 'Student', 'Status']
        rows = att.rows.map((r) => [r.date, r.className, r.studentId, r.studentName, r.status])
      } else if (id === 'fees') {
        const { data, error: err } = await getFees()
        if (err) throw err
        headers = ['Fee ID', 'Student ID', 'Student', 'Class', 'Type', 'Amount', 'Due Date', 'Paid Date', 'Status']
        rows = (data || []).map((f) => [f.id, f.studentId, f.studentName || '', f.className || '', f.type, f.amount, f.dueDate || '', f.paidDate || '', f.status])
      } else if (id === 'examinations') {
        const [examRes, resRes] = await Promise.all([getExams(), getAllResults()])
        if (examRes.error) throw examRes.error
        if (resRes.error) throw resRes.error
        const examList = examRes.data || []
        const resultList = resRes.data || []
        const withResults = new Set(resultList.map((r) => r.examId))
        headers = ['Exam', 'Subject', 'Class', 'Date', 'Max Marks', 'Student ID', 'Student', 'Marks', 'Grade']
        rows = resultList.map((r) => [
          r.exam?.name || '', r.exam?.subject || '', r.exam?.className || '', r.exam?.date || '',
          r.exam?.maxMarks ?? '', r.studentId, r.studentName || '', r.marks ?? '', r.grade ?? '',
        ])
        examList.filter((e) => !withResults.has(e.id)).forEach((e) => {
          rows.push([e.name, e.subject, e.className, e.date, e.maxMarks ?? '', '', '', '', ''])
        })
      }

      const csv = csvText(headers, rows)
      const filename = `ledgerhall-${id}-${day}.csv`
      const bytes = downloadText(filename, csv)
      setRecent((prev) => [
        {
          id: `R-${String(prev.length + 1).padStart(4, '0')}`,
          name: `${label} — ${fmtDate(day)}`,
          type: label.split(' ')[0],
          date: day,
          size: `${Math.max(1, Math.round(bytes / 1024))} KB`,
          status: 'Ready',
          csv,
          filename,
        },
        ...prev,
      ])
      setGenerated((g) => ({ ...g, [id]: day }))
    } catch (e) {
      setActionError(friendlyError(e))
      setGenerated((g) => {
        if (!g[id]) return g
        const next = { ...g }
        delete next[id]
        return next
      })
    } finally {
      setGenerating((g) => ({ ...g, [id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Reports</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Generate and download academic, attendance, and financial reports</p>
      </div>

      {(actionError || error) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {actionError || error}
        </p>
      )}

      {/* Report type cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORT_TYPES.map((r) => {
          const toneStyle = TONE_STYLES[r.tone]
          const Icon = r.icon
          const isGen = generating[r.id]
          const isDone = !!generated[r.id]
          return (
            <div key={r.id} className="flex flex-col rounded-xl border border-border bg-surface-card p-5 shadow-card">
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneStyle.icon}`}>
                  <Icon size={21} strokeWidth={1.7} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-text">{r.label}</p>
                  <p className="mt-0.5 text-[13px] text-text-secondary leading-relaxed">{r.description}</p>
                </div>
              </div>

              {/* Mini stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {reportStats[r.id].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-surface px-3 py-2.5 text-center">
                    <p className="text-[15px] font-semibold text-text">{value}</p>
                    <p className="mt-0.5 text-[11px] text-text-secondary leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full w-full opacity-20" style={{ background: toneStyle.bar }} />
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[12px] text-text-secondary">Last generated: {generated[r.id] ? fmtDate(generated[r.id]) : '—'}</p>
                <button
                  onClick={() => !isGen && generate(r.id, r.label)}
                  disabled={isGen}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all border"
                  style={{
                    background: isDone ? '#f0fdf4' : isGen ? 'rgba(28,58,40,0.06)' : '#1C3A28',
                    color: isDone ? '#059669' : isGen ? '#1C3A28' : '#fff',
                    borderColor: isDone ? '#bbf7d0' : isGen ? 'rgba(28,58,40,0.15)' : '#1C3A28',
                  }}
                >
                  {isGen ? (
                    <><RefreshCw size={14} className="animate-spin" /> Generating…</>
                  ) : isDone ? (
                    <><CheckCircle2 size={14} /> Generated!</>
                  ) : (
                    <><Download size={14} /> Generate</>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent reports */}
      <div className="rounded-xl border border-border bg-surface-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-text">Recent Reports</p>
            <p className="text-[13px] text-text-secondary mt-0.5">{recent.length} reports available</p>
          </div>
          <BarChart3 size={18} className="text-text-secondary" />
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 && (
            <div className="px-5 py-8 text-center text-[13.5px] text-text-secondary">No reports generated yet.</div>
          )}
          {recent.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface/50 transition-colors">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/[0.06] text-navy">
                <FileText size={16} strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-text truncate">{r.name}</p>
                <p className="text-[12px] text-text-secondary">{r.type} · {fmtDate(r.date)} · {r.size}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="flex items-center gap-1 text-[12px] font-medium text-emerald-600">
                  <Clock size={11} /> {r.status}
                </span>
                <button className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-navy transition-colors"
                  title="Preview">
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => downloadText(r.filename, r.csv)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-navy transition-colors"
                  title="Download">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
