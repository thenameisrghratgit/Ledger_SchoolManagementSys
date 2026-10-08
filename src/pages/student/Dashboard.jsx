import { useEffect, useState } from 'react'
import { ClipboardCheck, FileText, Wallet, CalendarDays, AlertCircle } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PERIODS } from '../../data/timetable.js'
import { getTimetableForClass } from '../../api/timetable.js'
import { getExamsForClass } from '../../api/examinations.js'
import { getFeesForStudent } from '../../api/fees.js'
import { getStudentAttendance } from '../../api/attendance.js'
import { friendlyError } from '../../lib/errors.js'

function todayDayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [timetable, setTimetable] = useState({})
  const [exams, setExams] = useState([])
  const [fees, setFees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const studentId = user?.studentId
  const className = user?.className

  useEffect(() => {
    if (!studentId || !className) {
      setLoading(false)
      return undefined
    }
    let cancelled = false
    Promise.all([
      getTimetableForClass(className),
      getExamsForClass(className),
      getFeesForStudent(studentId),
      getStudentAttendance(studentId),
    ]).then(([ttRes, examRes, feeRes, attRes]) => {
      if (cancelled) return
      setTimetable(ttRes.data || {})
      setExams(examRes.data || [])
      setFees(feeRes.data || [])
      setAttendance(attRes.data || [])
      const firstError = ttRes.error || examRes.error || feeRes.error || attRes.error
      if (firstError) setError(friendlyError(firstError))
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [studentId, className])

  if (!studentId || !className) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        Your student record is missing. Please contact your administrator.
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-14">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    )
  }

  const firstName = (user.student?.name || user.name || 'Student').split(' ')[0]
  const day = todayDayName()
  const todaySlots = timetable[day] || []
  const contentPeriods = PERIODS.filter((p) => !p.isBreak)
  const todaySchedule = contentPeriods
    .map((p, i) => ({ ...p, cell: todaySlots[i] }))
    .filter((p) => p.cell)

  const myExams = exams
    .filter((e) => e.status === 'Upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))
  const pendingFees = fees.filter((f) => f.status !== 'Paid')

  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRecords = attendance.filter((r) => (r.date || '').slice(0, 7) === monthKey)
  const monthPresent = monthRecords.filter((r) => r.status === 'P' || r.status === 'L').length
  const attendanceRate = monthRecords.length > 0
    ? `${Math.round((monthPresent / monthRecords.length) * 100)}%`
    : '—'

  const SUBJECT_COLORS = {
    'Mathematics': '#3b82f6', 'Physics': '#7c3aed', 'Chemistry': '#059669',
    'Biology': '#65a30d', 'English': '#0284c7', 'Hindi': '#ea580c',
    'Social Studies': '#d97706', 'Computer Sc.': '#4f46e5', 'Fine Arts': '#db2777', 'Phys. Ed.': '#0d9488',
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-white p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-text">Good {greeting()}, {firstName}! 👋</h2>
            <p className="mt-1 text-[14px] text-text-secondary">{className} – Section {user.section} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-[12px] font-semibold text-blue-700">{studentId}</span>
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Upcoming Exams"  value={myExams.length}      sub="In your class"         icon={FileText}    tone="navy" />
        <StatCard label="Attendance"      value={attendanceRate}       sub="This month"            icon={ClipboardCheck} tone="emerald" />
        <StatCard label="Pending Fees"    value={pendingFees.length}   sub="Require payment"       icon={Wallet}      tone="rose" />
        <StatCard label="Classes Today"   value={todaySchedule.length} sub={`${day}'s schedule`}   icon={CalendarDays} tone="gold" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Today's timetable */}
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-[15px] font-semibold text-text">Today's Schedule — {day}</h3>
          {todaySchedule.length === 0 ? (
            <p className="text-[14px] text-text-secondary">No classes scheduled today.</p>
          ) : (
            <div className="space-y-2.5">
              {todaySchedule.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-white text-[10px] font-bold"
                    style={{ background: SUBJECT_COLORS[p.cell.s] || '#6b7280' }}>
                    {(p.cell.s || '—').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-text">{p.cell.s || '—'}</p>
                    <p className="text-[12px] text-text-secondary">{p.cell.t || '—'}</p>
                  </div>
                  <span className="text-[12px] text-text-secondary">{p.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming exams */}
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-[15px] font-semibold text-text">Upcoming Exams</h3>
          {myExams.length === 0 ? (
            <p className="text-[14px] text-text-secondary">No upcoming exams scheduled.</p>
          ) : (
            <div className="space-y-2.5">
              {myExams.slice(0, 5).map((e) => {
                const d = new Date(e.date + 'T00:00:00')
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-navy/[0.07] text-navy">
                      <span className="text-[13px] font-bold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] font-medium">{d.toLocaleString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-text">{e.subject}</p>
                      <p className="text-[12px] text-text-secondary">{e.type} · {e.time || '—'} · {e.room || '—'}</p>
                    </div>
                    <span className="text-[12px] font-medium text-text-secondary">{e.maxMarks}M</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fee summary */}
      {pendingFees.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Wallet size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="text-[14px] font-semibold text-amber-800">
                {pendingFees.length} pending fee payment{pendingFees.length > 1 ? 's' : ''}
              </p>
              <p className="text-[13px] text-amber-700 mt-0.5">
                Total outstanding: ₹{pendingFees.reduce((s, f) => s + Number(f.amount || 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
