import { useEffect, useState } from 'react'
import { GraduationCap, ClipboardCheck, Wallet, FileText, AlertCircle } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PERIODS } from '../../data/timetable.js'
import { getStudentById } from '../../api/students.js'
import { getStudentAttendance } from '../../api/attendance.js'
import { getExamsForClass } from '../../api/examinations.js'
import { getFeesForStudent } from '../../api/fees.js'
import { getTimetableForClass } from '../../api/timetable.js'
import { friendlyError } from '../../lib/errors.js'

function todayDayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
}
function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function ParentDashboard() {
  const { user } = useAuth()
  const childId = user?.childStudentId

  const [child, setChild] = useState(null)
  const [fees, setFees] = useState([])
  const [exams, setExams] = useState([])
  const [records, setRecords] = useState([])
  const [tt, setTt] = useState(null)
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
      const [feeRes, examRes, attRes, ttRes] = await Promise.all([
        getFeesForStudent(c.studentId),
        getExamsForClass(c.className),
        getStudentAttendance(c.studentId),
        getTimetableForClass(c.className),
      ])
      if (cancelled) return
      const errs = [feeRes.error, examRes.error, attRes.error, ttRes.error].filter(Boolean)
      if (errs.length) setError(errs.map((e) => friendlyError(e)).join(' '))
      setFees(feeRes.data || [])
      setExams(examRes.data || [])
      setRecords(attRes.data || [])
      setTt(ttRes.data || null)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [childId])

  const day            = todayDayName()
  const pendingFees    = fees.filter((f) => f.status === 'Pending' || f.status === 'Overdue')
  const pendingAmt     = pendingFees.reduce((s, f) => s + Number(f.amount || 0), 0)
  const upcomingExams  = exams.filter((e) => e.status === 'Upcoming').slice(0, 4)
  const contentPeriods = PERIODS.filter((p) => !p.isBreak)
  const todaySlots     = tt ? (tt[day] || []).map((cell, i) => ({ ...contentPeriods[i], cell })).filter((s) => s.cell) : []
  const attTotal       = records.length
  const attPct         = attTotal ? Math.round((records.filter((r) => r.status === 'P' || r.status === 'L').length / attTotal) * 100) : null

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-5 shadow-card"
        style={{ background: 'linear-gradient(135deg, #F3EEFF, #fff)' }}>
        <h2 className="text-[20px] font-semibold text-text">{greet()}, {user?.name?.split(' ')[0] || 'Parent'} 👋</h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

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
          {/* Child info */}
          <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[20px] font-bold text-white shadow"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5b21b6)' }}>
              {child.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-[16px] font-bold text-text">{child.name}</p>
              <p className="text-[13.5px] text-text-secondary">{child.className} · Section {child.section || '—'} · {child.studentId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Class"         value={child.className}    sub={`Section ${child.section || '—'}`}     icon={GraduationCap}  tone="navy" />
            <StatCard label="Today Classes" value={todaySlots.length}  sub={day}                            icon={ClipboardCheck} tone="gold" />
            <StatCard label="Pending Fees"  value={'₹' + pendingAmt.toLocaleString('en-IN')} sub="Unpaid / overdue" icon={Wallet} tone="rose" />
            <StatCard label="Upcoming Exams" value={upcomingExams.length} sub="Scheduled"                   icon={FileText}       tone="emerald" />
            <StatCard label="Attendance"    value={attPct === null ? '—' : `${attPct}%`} sub="Overall"       icon={ClipboardCheck} tone="emerald" />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Today's schedule */}
            <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
              <h3 className="mb-4 text-[15px] font-semibold text-text">Today's Schedule — {day}</h3>
              {todaySlots.length === 0 ? (
                <p className="text-[14px] text-text-secondary">No classes today or timetable not set.</p>
              ) : (
                <div className="space-y-2.5">
                  {todaySlots.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-bold text-violet-800">
                        {(p.cell.s || '—').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13.5px] font-medium text-text">{p.cell.s || '—'}</p>
                        <p className="text-[12px] text-text-secondary">{p.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming exams */}
            <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
              <h3 className="mb-4 text-[15px] font-semibold text-text">Upcoming Exams</h3>
              {upcomingExams.length === 0 ? (
                <p className="text-[14px] text-text-secondary">No upcoming exams for {child.className}.</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingExams.map((e) => {
                    const d = new Date(e.date + 'T00:00:00')
                    const daysLeft = Math.ceil((d - new Date()) / 86400000)
                    return (
                      <div key={e.id} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                          <span className="text-[13px] font-bold leading-none">{d.getDate()}</span>
                          <span className="text-[10px] font-medium">{d.toLocaleString('en-IN', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-medium text-text truncate">{e.subject}</p>
                          <p className="text-[12px] text-text-secondary">{e.type} · {e.room || '—'}</p>
                        </div>
                        <span className={`text-[12px] font-semibold ${daysLeft <= 3 ? 'text-rose-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-text-secondary'}`}>
                          {daysLeft}d
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {pendingFees.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
              <p className="text-[14px] font-semibold text-rose-700">
                {pendingFees.length} pending / overdue fee{pendingFees.length > 1 ? 's' : ''} — please visit the Fees section.
              </p>
            </div>
          )}
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
