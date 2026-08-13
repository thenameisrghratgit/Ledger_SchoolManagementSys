import { Users, GraduationCap, ClipboardCheck, Wallet, UserPlus, FileCheck2, CalendarClock, AlertCircle } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const ACTIVITY = [
  {
    icon: UserPlus,
    tone: 'navy',
    text: 'New student "Aarav Krishnan" registered in Grade 8 - B',
    time: '12 minutes ago',
  },
  {
    icon: Wallet,
    tone: 'gold',
    text: 'Fee payment of ₹18,500 received from Grade 10 - A',
    time: '48 minutes ago',
  },
  {
    icon: FileCheck2,
    tone: 'emerald',
    text: 'Mid-term examination timetable published for Grades 9-12',
    time: '2 hours ago',
  },
  {
    icon: AlertCircle,
    tone: 'rose',
    text: '3 pending fee reminders overdue in Grade 7 - C',
    time: '5 hours ago',
  },
  {
    icon: CalendarClock,
    tone: 'navy',
    text: 'Staff meeting scheduled for Friday, 3:30 PM',
    time: 'Yesterday',
  },
]

export default function Dashboard() {
  const { user } = useAuth()

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value="1,284" sub="+18 this month" icon={Users} tone="navy" />
        <StatCard label="Total Teachers" value="76" sub="4 on leave today" icon={GraduationCap} tone="gold" />
        <StatCard label="Attendance Today" value="94.2%" sub="1,210 of 1,284 present" icon={ClipboardCheck} tone="emerald" />
        <StatCard label="Pending Fees" value="₹6.4L" sub="212 students pending" icon={Wallet} tone="rose" />
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
            {ACTIVITY.map((item, i) => {
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
            {[
              ['Active classes', '32'],
              ['Upcoming exams', '4'],
              ['Open staff positions', '2'],
              ['Fee collection rate', '87%'],
            ].map(([label, value]) => (
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
