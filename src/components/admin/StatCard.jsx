export default function StatCard({ label, value, sub, icon: Icon, tone = 'navy' }) {
  const tones = {
    navy: 'bg-navy/[0.06] text-navy',
    gold: 'bg-gold/[0.14] text-gold-600',
    rose: 'bg-rose-50 text-rose-500',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="rounded-xl border border-border bg-surface-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-text-secondary">{label}</p>
          <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight text-text">{value}</p>
          {sub && <p className="mt-2 text-[12.5px] text-text-secondary">{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
            <Icon size={19} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  )
}
