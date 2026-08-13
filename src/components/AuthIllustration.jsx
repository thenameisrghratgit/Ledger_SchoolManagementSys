import SchoolLogo from './SchoolLogo.jsx'
import authCampus from '../assets/auth-campus.jpg'

export default function AuthIllustration({
  eyebrow = 'Ledgerhall',
  title = 'One record, every classroom.',
  copy = 'Admissions, attendance, and parent communication — in one place.',
}) {
  return (
    <div className="relative hidden min-h-full overflow-hidden bg-navy-deep lg:flex lg:flex-col lg:justify-between">
      <img
        src={authCampus}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-deep/85 via-navy-deep/70 to-navy/60"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-full flex-col justify-between p-10 xl:p-12">
        <div className="flex items-center gap-3">
          <SchoolLogo size={32} />
          <span className="text-sm font-semibold tracking-wide text-white/90">{eyebrow}</span>
        </div>

        <div>
          <h2 className="max-w-sm text-[1.75rem] font-semibold leading-snug text-white">{title}</h2>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-white/70">{copy}</p>
          <div className="mt-8 h-px w-12 bg-gold" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
