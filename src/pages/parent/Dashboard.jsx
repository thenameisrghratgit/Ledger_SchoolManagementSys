import { GraduationCap, ClipboardCheck, Wallet, FileText } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_STUDENTS } from '../../data/students.js'
import { SEED_EXAMS } from '../../data/examinations.js'
import { SEED_FEES } from '../../data/fees.js'
import { SEED_TIMETABLES, DAYS, PERIODS } from '../../data/timetable.js'

function todayDayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
}
function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function ParentDashboard() {
  const { user } = useAuth()
  const childId  = user?.childStudentId || 'STU-2026-0142'
  const child    = SEED_STUDENTS.find((s) => s.studentId === childId) || SEED_STUDENTS[0]

  const childFees      = SEED_FEES.filter((f) => f.studentId === child.studentId)
  const pendingFees    = childFees.filter((f) => f.status === 'Pending' || f.status === 'Overdue')
  const upcomingExams  = SEED_EXAMS.filter((e) => e.status === 'Upcoming' && e.className === child.className).slice(0, 4)

  const day            = todayDayName()
  const contentPeriods = PERIODS.filter((p) => !p.isBreak)
  const tt             = SEED_TIMETABLES[child.className]
  const todaySlots     = tt ? (tt[day] || []).map((cell, i) => ({ ...contentPeriods[i], cell })).filter((s) => s.cell) : []

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-5 shadow-card"
        style={{ background: 'linear-gradient(135deg, #F3EEFF, #fff)' }}>
        <h2 className="text-[20px] font-semibold text-text">{greet()}, {user?.name?.split(' ')[0] || 'Parent'} 👋</h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Child info */}
      <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card flex items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[20px] font-bold text-white shadow"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5b21b6)' }}>
          {child.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <p className="text-[16px] font-bold text-text">{child.name}</p>
          <p className="text-[13.5px] text-text-secondary">{child.className} · Section {child.section} · {child.studentId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Class"         value={child.className}    sub={`Section ${child.section}`}     icon={GraduationCap}  tone="navy" />
        <StatCard label="Today Classes" value={todaySlots.length}  sub={day}                            icon={ClipboardCheck} tone="gold" />
        <StatCard label="Pending Fees"  value={pendingFees.length} sub="Unpaid / overdue"               icon={Wallet}         tone="rose" />
        <StatCard label="Upcoming Exams" value={upcomingExams.length} sub="Scheduled"                   icon={FileText}       tone="emerald" />
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
                    {p.cell.s.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-medium text-text">{p.cell.s}</p>
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
                      <p className="text-[12px] text-text-secondary">{e.type} · {e.room}</p>
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
    </div>
  )
}
