import { useState } from 'react'
import { GraduationCap, ClipboardCheck, FileText, Users, Check } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { SEED_TEACHERS } from '../../data/teachers.js'
import { SEED_STUDENTS } from '../../data/students.js'
import { SEED_EXAMS } from '../../data/examinations.js'
import { SEED_TIMETABLES, DAYS, PERIODS } from '../../data/timetable.js'

function todayDayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
}

const SUBJECT_COLORS = {
  'Mathematics': '#3b82f6', 'Physics': '#7c3aed', 'Chemistry': '#059669',
  'Biology': '#65a30d', 'English': '#0284c7', 'Hindi': '#ea580c',
  'Social Studies': '#d97706', 'Computer Sc.': '#4f46e5', 'Fine Arts': '#db2777', 'Phys. Ed.': '#0d9488',
}

const SELF_STATUS = {
  P: { label: 'Present',  btn: 'bg-emerald-600 border-emerald-600 text-white', pill: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  A: { label: 'Absent',   btn: 'bg-rose-600 border-rose-600 text-white',       pill: 'bg-rose-50 border-rose-200 text-rose-700' },
  L: { label: 'Half Day', btn: 'bg-amber-500 border-amber-500 text-white',     pill: 'bg-amber-50 border-amber-200 text-amber-700' },
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const teacherId = user?.teacherId || 'TCH-001'
  const teacher   = SEED_TEACHERS.find((t) => t.teacherId === teacherId) || SEED_TEACHERS[0]

  const myClasses = ['Class 9', 'Class 10', 'Class 11', 'Class 12'].filter((c) => teacher.classes?.includes(c.replace('Class ', '')))
  const myStudentsCount = SEED_STUDENTS.filter((s) => myClasses.includes(s.className)).length

  const day            = todayDayName()
  const contentPeriods = PERIODS.filter((p) => !p.isBreak)
  const todaySlots     = []
  Object.entries(SEED_TIMETABLES).forEach(([cls, tt]) => {
    const slots = tt[day] || []
    contentPeriods.forEach((p, i) => {
      const cell = slots[i]
      if (cell && teacher.subjects.some((s) => cell.s.includes(s.split(' ')[0]))) {
        todaySlots.push({ ...p, cell: { ...cell, class: cls } })
      }
    })
  })
  todaySlots.sort((a, b) => a.time.localeCompare(b.time))

  const upcomingExams = SEED_EXAMS.filter((e) =>
    e.status === 'Upcoming' && teacher.subjects.some((s) => e.subject.includes(s.split(' ')[0]))
  ).slice(0, 4)

  // Self-attendance state
  const todayISO = new Date().toISOString().split('T')[0]
  const [selfStatus, setSelfStatus] = useState(null)
  const [selfSaved, setSelfSaved]   = useState(false)

  const handleSelfMark = (s) => { setSelfStatus(s); setSelfSaved(false) }
  const handleSelfSave = () => setSelfSaved(true)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl border border-border p-5 shadow-card"
        style={{ background: 'linear-gradient(135deg, #FDF3EC, #fff)' }}>
        <h2 className="text-[20px] font-semibold text-text">Welcome, {teacher.name.split(' ').slice(-1)[0]}! 👋</h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          {teacher.department} · {teacher.subjects.join(', ')} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="My Students"   value={myStudentsCount || 24}  sub="Across all classes"  icon={Users}          tone="navy" />
        <StatCard label="Classes Today" value={todaySlots.length}      sub={`${day}'s schedule`} icon={GraduationCap}  tone="gold" />
        <StatCard label="Pending Marks" value={upcomingExams.length}   sub="Awaiting results"    icon={FileText}       tone="rose" />
        <StatCard label="My Status"     value={selfSaved ? SELF_STATUS[selfStatus]?.label : 'Not marked'} sub="Today's attendance" icon={ClipboardCheck} tone="emerald" />
      </div>

      {/* Self-attendance widget */}
      <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-text">Mark Your Attendance</p>
            <p className="text-[13px] text-text-secondary mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {selfSaved && (
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold
              ${SELF_STATUS[selfStatus].pill}"
              style={{ borderColor: selfStatus === 'P' ? '#6ee7b7' : selfStatus === 'A' ? '#fca5a5' : '#fcd34d',
                       background:   selfStatus === 'P' ? '#ecfdf5' : selfStatus === 'A' ? '#fff1f2' : '#fffbeb',
                       color:        selfStatus === 'P' ? '#065f46' : selfStatus === 'A' ? '#9f1239' : '#92400e' }}>
              <Check size={13} /> Marked {SELF_STATUS[selfStatus]?.label}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {Object.entries(SELF_STATUS).map(([key, s]) => (
            <button key={key} onClick={() => handleSelfMark(key)}
              className={`rounded-xl border px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
                selfStatus === key ? s.btn : 'border-border bg-surface-card text-text hover:border-[#C6D0DB]'
              }`}>
              {s.label}
            </button>
          ))}

          {selfStatus && !selfSaved && (
            <button onClick={handleSelfSave}
              className="ml-auto flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm"
              style={{ background: '#C4622D' }}>
              <Check size={14} /> Save
            </button>
          )}
          {selfSaved && (
            <button onClick={() => { setSelfStatus(null); setSelfSaved(false) }}
              className="ml-auto rounded-xl border border-border px-4 py-2.5 text-[13px] text-text-secondary hover:bg-surface transition-colors">
              Change
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Today's schedule */}
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-[15px] font-semibold text-text">Today's Classes — {day}</h3>
          {todaySlots.length === 0 ? (
            <p className="text-[14px] text-text-secondary">No classes assigned to you today.</p>
          ) : (
            <div className="space-y-2.5">
              {todaySlots.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-[11px] font-bold"
                    style={{ background: SUBJECT_COLORS[p.cell.s] || '#6b7280' }}>
                    {p.cell.s.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-medium text-text">{p.cell.s} — {p.cell.class}</p>
                    <p className="text-[12px] text-text-secondary">{p.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming exams to assess */}
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-[15px] font-semibold text-text">Upcoming Exams to Assess</h3>
          {upcomingExams.length === 0 ? (
            <p className="text-[14px] text-text-secondary">No upcoming exams assigned to you.</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingExams.map((e) => {
                const d = new Date(e.date + 'T00:00:00')
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gold/[0.1] text-gold-600">
                      <span className="text-[13px] font-bold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] font-medium">{d.toLocaleString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-text truncate">{e.subject} — {e.className}</p>
                      <p className="text-[12px] text-text-secondary">{e.type} · {e.room}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
