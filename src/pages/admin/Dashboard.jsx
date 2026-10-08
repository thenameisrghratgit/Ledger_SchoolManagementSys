import { useEffect, useMemo, useState } from 'react'
import { Users, GraduationCap, ClipboardCheck, Wallet, CalendarClock, AlertCircle } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getStudents } from '../../api/students.js'
import { getTeachers } from '../../api/teachers.js'
import { getExams } from '../../api/examinations.js'
import { getFees } from '../../api/fees.js'
import { getAttendanceForClass } from '../../api/attendance.js'
import { friendlyError } from '../../lib/errors.js'

function fmtINR(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [exams, setExams] = useState([])
  const [fees, setFees] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const today = todayISO()

    const load = async () => {
      const [stuRes, teaRes, examRes, feeRes] = await Promise.all([
        getStudents(), getTeachers(), getExams(), getFees(),
      ])
      if (cancelled) return
      const failed = [stuRes, teaRes, examRes, feeRes].find((r) => r.error)
      if (failed) {
        setError(friendlyError(failed.error))
        setLoading(false)
        return
      }
      const stu = stuRes.data || []
      setStudents(stu)
      setTeachers(teaRes.data || [])
      setExams(examRes.data || [])
      setFees(feeRes.data || [])

      const classes = [...new Set(stu.map((s) => s.className).filter(Boolean))]
      let present = 0
      let total = 0
      let attOk = true
      for (const cls of classes) {
        const { data, error: err } = await getAttendanceForClass(cls, today)
        if (cancelled) return
        if (err) {
          setError(friendlyError(err))
          attOk = false
          break
        }
        ;(data || []).forEach((r) => {
          total += 1
          if (r.status === 'Present') present += 1
        })
      }
      if (attOk) setAttendance({ present, total })
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  const paidFees = fees.filter((f) => f.status === 'Paid')
  const unpaidFees = fees.filter((f) => f.status === 'Pending' || f.status === 'Overdue')
  const collected = paidFees.reduce((s, f) => s + Number(f.amount || 0), 0)
  const pendingAmount = unpaidFees.reduce((s, f) => s + Number(f.amount || 0), 0)
  const pendingStudents = new Set(unpaidFees.map((f) => f.studentId)).size
  const overdueCount = fees.filter((f) => f.status === 'Overdue').length
  const billed = fees.reduce((s, f) => s + Number(f.amount || 0), 0)
  const activeStudents = students.filter((s) => s.status === 'Active').length
  const activeTeachers = teachers.filter((t) => t.status === 'Active').length
  const classCount = new Set(students.map((s) => s.className).filter(Boolean)).size
  const today = todayISO()
  const upcomingExams = exams.filter((e) => e.date && e.date >= today)

  const attendanceValue = loading
    ? '—'
    : attendance
      ? (attendance.total > 0 ? `${Math.round((attendance.present / attendance.total) * 100)}%` : '—')
      : '—'
  const attendanceSub = loading
    ? 'Loading…'
    : attendance
      ? (attendance.total > 0 ? `${attendance.present} of ${attendance.total} present` : 'No attendance recorded today')
      : 'Attendance unavailable'

  const activity = useMemo(() => {
    const items = []
    fees.forEach((f) => {
      if (f.status === 'Paid' && f.paidDate) {
        items.push({
          date: f.paidDate,
          icon: Wallet,
          tone: 'gold',
          text: `Fee payment of ${fmtINR(f.amount)} received from ${f.studentName || f.studentId}`,
          time: fmtDate(f.paidDate),
        })
      } else if (f.status === 'Overdue') {
        items.push({
          date: f.dueDate,
          icon: AlertCircle,
          tone: 'rose',
          text: `${f.type} fee of ${fmtINR(f.amount)} overdue for ${f.studentName || f.studentId}`,
          time: f.dueDate ? fmtDate(f.dueDate) : '—',
        })
      }
    })
    exams.forEach((e) => {
      if (e.date && e.date >= today) {
        items.push({
          date: e.date,
          icon: CalendarClock,
          tone: 'navy',
          text: `${e.name} — ${e.subject} (${e.className})`,
          time: fmtDate(e.date),
        })
      }
    })
    items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    return items.slice(0, 6)
  }, [fees, exams, today])

  const overview = [
    ['Active classes', loading ? '—' : classCount],
    ['Upcoming exams', loading ? '—' : upcomingExams.length],
    ['Overdue fee records', loading ? '—' : overdueCount],
    ['Fee collection rate', loading || billed === 0 ? '—' : `${Math.round((collected / billed) * 100)}%`],
  ]

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">
          Welcome back, {user?.name || 'Administrator'}
        </h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">
          Here&apos;s what&apos;s happening across the school today.
        </p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={loading ? '—' : students.length} sub={loading ? '—' : `${activeStudents} active`} icon={Users} tone="navy" />
        <StatCard label="Total Teachers" value={loading ? '—' : teachers.length} sub={loading ? '—' : `${activeTeachers} active`} icon={GraduationCap} tone="gold" />
        <StatCard label="Attendance Today" value={attendanceValue} sub={attendanceSub} icon={ClipboardCheck} tone="emerald" />
        <StatCard label="Pending Fees" value={loading ? '—' : fmtINR(pendingAmount)} sub={loading ? '—' : `${pendingStudents} students pending`} icon={Wallet} tone="rose" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text">Recent Activity</h3>
            <button className="focus-ring rounded text-[13px] font-medium text-navy hover:text-navy-deep hover:underline underline-offset-2">
              View all
            </button>
          </div>

          <ul className="mt-4 divide-y divide-border">
            {loading ? (
              <li className="flex items-center justify-center py-10">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
              </li>
            ) : activity.length === 0 ? (
              <li className="py-3.5 text-[13.5px] text-text-secondary">No recent activity yet.</li>
            ) : activity.map((item, i) => {
              const tones = {
                navy: 'bg-navy/[0.06] text-navy',
                gold: 'bg-gold/[0.14] text-gold-600',
                rose: 'bg-rose-50 text-rose-500',
                emerald: 'bg-emerald-50 text-emerald-600',
              }
              const Icon = item.icon
              return (
                <li key={i} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[item.tone]}`}>
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] leading-snug text-text">{item.text}</p>
                    <p className="mt-0.5 text-[12px] text-text-secondary">{item.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
          <h3 className="text-[15px] font-semibold text-text">Quick Overview</h3>
          <dl className="mt-4 space-y-4">
            {overview.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <dt className="text-[13.5px] text-text-secondary">{label}</dt>
                <dd className="text-[13.5px] font-semibold text-text">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
