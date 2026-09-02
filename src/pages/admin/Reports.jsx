import { useState } from 'react'
import {
  BarChart3, Users, ClipboardCheck, Wallet, FileText,
  Download, RefreshCw, CheckCircle2, Clock, Eye,
} from 'lucide-react'

const REPORT_TYPES = [
  {
    id: 'enrollment',
    label: 'Enrollment Report',
    description: 'Total students by class, gender breakdown, new admissions this term.',
    icon: Users,
    tone: 'navy',
    stats: [
      { label: 'Total Students', value: '1,284' },
      { label: 'New This Term', value: '47' },
      { label: 'Graduated', value: '112' },
    ],
    lastGenerated: '2026-09-01',
  },
  {
    id: 'attendance',
    label: 'Attendance Report',
    description: 'Class-wise attendance rates, chronic absentees, monthly trends.',
    icon: ClipboardCheck,
    tone: 'emerald',
    stats: [
      { label: 'Avg Attendance', value: '94.2%' },
      { label: 'Chronic Absent', value: '18' },
      { label: 'Perfect Attendance', value: '243' },
    ],
    lastGenerated: '2026-09-01',
  },
  {
    id: 'fees',
    label: 'Fee Collection Report',
    description: 'Collection summary, outstanding dues, overdue accounts, payment trends.',
    icon: Wallet,
    tone: 'gold',
    stats: [
      { label: 'Collected', value: '₹46,500' },
      { label: 'Pending', value: '₹41,000' },
      { label: 'Overdue', value: '₹72,500' },
    ],
    lastGenerated: '2026-09-01',
  },
  {
    id: 'examinations',
    label: 'Examination Results',
    description: 'Subject-wise pass rates, toppers, grade distribution, class performance.',
    icon: FileText,
    tone: 'rose',
    stats: [
      { label: 'Exams Conducted', value: '8' },
      { label: 'Avg Score', value: '72%' },
      { label: 'Pass Rate', value: '91%' },
    ],
    lastGenerated: '2026-08-28',
  },
]

const RECENT_REPORTS = [
  { id: 'R-0042', name: 'Attendance Report — August 2026',   type: 'Attendance',   date: '2026-09-01', size: '148 KB', status: 'Ready' },
  { id: 'R-0041', name: 'Fee Collection — Q2 2026',          type: 'Fees',         date: '2026-09-01', size: '92 KB',  status: 'Ready' },
  { id: 'R-0040', name: 'Enrollment Summary — Term 1 2026',  type: 'Enrollment',   date: '2026-09-01', size: '64 KB',  status: 'Ready' },
  { id: 'R-0039', name: 'Mid-Term Results — Grade 10',       type: 'Examinations', date: '2026-08-28', size: '210 KB', status: 'Ready' },
  { id: 'R-0038', name: 'Attendance Report — July 2026',     type: 'Attendance',   date: '2026-08-02', size: '141 KB', status: 'Ready' },
]

const TONE_STYLES = {
  navy:    { icon: 'bg-navy/[0.07] text-navy',         bar: '#1C3A28' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600',   bar: '#059669' },
  gold:    { icon: 'bg-gold/[0.12] text-gold-600',     bar: '#C4622D' },
  rose:    { icon: 'bg-rose-50 text-rose-500',         bar: '#f43f5e' },
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function Reports() {
  const [generating, setGenerating] = useState({})
  const [generated, setGenerated] = useState({})
  const [recent, setRecent] = useState(RECENT_REPORTS)

  const generate = (id, label) => {
    setGenerating((g) => ({ ...g, [id]: true }))
    setTimeout(() => {
      setGenerating((g) => ({ ...g, [id]: false }))
      setGenerated((g) => ({ ...g, [id]: true }))
      const today = new Date().toISOString().split('T')[0]
      setRecent((r) => [
        { id: `R-${String(Date.now()).slice(-4)}`, name: `${label} — ${fmtDate(today)}`, type: label.split(' ')[0], date: today, size: `${Math.round(60 + Math.random() * 180)} KB`, status: 'Ready' },
        ...r,
      ])
      setTimeout(() => setGenerated((g) => ({ ...g, [id]: false })), 2500)
    }, 1800)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Reports</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Generate and download academic, attendance, and financial reports</p>
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORT_TYPES.map((r) => {
          const toneStyle = TONE_STYLES[r.tone]
          const Icon = r.icon
          const isGen = generating[r.id]
          const isDone = generated[r.id]
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
                {r.stats.map(({ label, value }) => (
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
                <p className="text-[12px] text-text-secondary">Last generated: {fmtDate(r.lastGenerated)}</p>
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
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-navy transition-colors"
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
