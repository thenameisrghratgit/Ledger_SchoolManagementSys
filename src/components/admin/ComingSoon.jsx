import { Construction } from 'lucide-react'

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-sm flex-col items-center rounded-xl border border-border bg-surface-card px-8 py-12 text-center shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/[0.06] text-navy">
          <Construction size={22} strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[17px] font-semibold text-text">{title}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
          {description || 'This module is coming soon. We\u2019re still building it out.'}
        </p>
        <span className="mt-5 inline-flex items-center rounded-full border border-gold/30 bg-gold/[0.12] px-3 py-1 text-[12px] font-semibold text-gold-600">
          Coming Soon
        </span>
      </div>
    </div>
  )
}
