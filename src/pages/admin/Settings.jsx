import { useEffect, useState } from 'react'
import {
  School, Bell, Shield, Palette, Save, CheckCircle2, AlertCircle,
  Mail, Phone, MapPin, Globe, GraduationCap,
} from 'lucide-react'
import SealMark from '../../components/SealMark.jsx'
import { getSettings, updateSettings } from '../../api/settings.js'
import { friendlyError } from '../../lib/errors.js'

const SECTIONS = [
  { id: 'school',       label: 'School Profile',     icon: School },
  { id: 'academic',     label: 'Academic Settings',  icon: GraduationCap },
  { id: 'notifications',label: 'Notifications',      icon: Bell },
  { id: 'security',     label: 'Security',           icon: Shield },
  { id: 'appearance',   label: 'Appearance',         icon: Palette },
]

const EMPTY_SETTINGS = {
  schoolName: '',
  address: '',
  phone: '',
  email: '',
  academicYear: '',
  currency: '',
}

export default function Settings() {
  const [active, setActive] = useState('school')
  const [saved, setSaved] = useState(null)
  const [settings, setSettings] = useState(EMPTY_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let cancelled = false
    getSettings().then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setLoadError(friendlyError(err))
      else {
        if (data) setSettings((prev) => ({ ...prev, ...data }))
        setLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [])

  const handleField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(null)
  }

  const handleSave = async (section) => {
    setSaveError('')
    if (!loaded) {
      setSaveError(loadError || 'School settings could not be loaded.')
      return
    }
    const { data, error: err } = await updateSettings(settings)
    if (err) {
      setSaveError(friendlyError(err))
      setSaved(null)
      return
    }
    if (data) setSettings((prev) => ({ ...prev, ...data }))
    setSaved(section)
  }

  const switchSection = (id) => {
    setActive(id)
    setSaved(null)
  }

  const disabled = !loaded

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-text">Settings</h2>
        <p className="mt-1 text-[14.5px] text-text-secondary">Configure your school profile, academic calendar, and system preferences</p>
      </div>

      {(loadError || saveError) && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {loadError || saveError}
        </p>
      )}

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Sidebar nav */}
        <div className="w-full lg:w-56 shrink-0">
          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => switchSection(id)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-all"
                style={{
                  background: active === id ? 'rgba(28,58,40,0.08)' : 'transparent',
                  color: active === id ? '#1C3A28' : '#6B6558',
                  fontWeight: active === id ? 600 : 500,
                }}
              >
                <Icon size={16} strokeWidth={active === id ? 2 : 1.8} className="shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Panel */}
        <div className="flex-1">
          {active === 'school'       && <SchoolProfile      values={settings} onField={handleField} onSave={() => handleSave('school')}       saved={saved === 'school'}       disabled={disabled} />}
          {active === 'academic'     && <AcademicSettings   values={settings} onField={handleField} onSave={() => handleSave('academic')}     saved={saved === 'academic'}     disabled={disabled} />}
          {active === 'notifications'&& <NotificationSettings onSave={() => handleSave('notifications')} saved={saved === 'notifications'} disabled={disabled} />}
          {active === 'security'     && <SecuritySettings   onSave={() => handleSave('security')}     saved={saved === 'security'}     disabled={disabled} />}
          {active === 'appearance'   && <AppearanceSettings values={settings} onField={handleField} onSave={() => handleSave('appearance')}   saved={saved === 'appearance'}   disabled={disabled} />}
        </div>
      </div>
    </div>
  )
}

function Card({ title, description, children, onSave, saved, disabled }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card shadow-card">
      <div className="border-b border-border px-6 py-5">
        <h3 className="text-[16px] font-semibold text-text">{title}</h3>
        {description && <p className="mt-0.5 text-[13.5px] text-text-secondary">{description}</p>}
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        {saved ? (
          <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-600">
            <CheckCircle2 size={15} /> Changes saved
          </span>
        ) : <span />}
        <button
          onClick={onSave}
          disabled={disabled}
          className="flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-deep transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={14} /> Save Changes
        </button>
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-text">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-text-secondary">{hint}</p>}
    </div>
  )
}

const inp = 'w-full rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-[14px] text-text placeholder:text-text-secondary focus:outline-none focus:border-navy transition-colors'

function SchoolProfile({ values, onField, onSave, saved, disabled }) {
  const [extra, setExtra] = useState({
    tagline: 'Shaping Futures, Building Leaders',
    website: 'www.ledgerhall.in',
    board: 'CBSE',
    established: '2008',
  })
  const set = (k) => (e) => onField(k, e.target.value)
  const setExtraField = (k) => (e) => {
    setExtra((f) => ({ ...f, [k]: e.target.value }))
    onField(k, e.target.value)
  }

  return (
    <Card title="School Profile" description="Your school's basic information and contact details." onSave={onSave} saved={saved} disabled={disabled}>
      {/* Logo */}
      <div className="flex items-center gap-5 rounded-xl bg-surface p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy/[0.07] text-navy">
          <SealMark size={40} animate={false} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-text">{values.schoolName}</p>
          <p className="text-[12.5px] text-text-secondary mt-0.5">School crest — managed by your branding team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="School Name">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
            <School size={15} className="shrink-0 text-text-secondary" />
            <input value={values.schoolName || ''} onChange={set('schoolName')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
          </div>
        </Field>
        <Field label="Tagline">
          <input value={extra.tagline} onChange={setExtraField('tagline')} className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Official Email">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
            <Mail size={15} className="shrink-0 text-text-secondary" />
            <input type="email" value={values.email || ''} onChange={set('email')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
          </div>
        </Field>
        <Field label="Phone Number">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
            <Phone size={15} className="shrink-0 text-text-secondary" />
            <input value={values.phone || ''} onChange={set('phone')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
          </div>
        </Field>
      </div>

      <Field label="Address">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
          <MapPin size={15} className="shrink-0 text-text-secondary mt-0.5" />
          <textarea value={values.address || ''} onChange={set('address')} rows={2} className="flex-1 resize-none border-none bg-transparent text-[14px] text-text focus:outline-none" />
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Website">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2.5">
            <Globe size={15} className="shrink-0 text-text-secondary" />
            <input value={extra.website} onChange={setExtraField('website')} className="flex-1 border-none bg-transparent text-[14px] text-text focus:outline-none" />
          </div>
        </Field>
        <Field label="Affiliated Board">
          <select value={extra.board} onChange={setExtraField('board')} className={inp}>
            {['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'].map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Established Year">
          <input type="number" value={extra.established} onChange={setExtraField('established')} className={inp} min="1800" max="2030" />
        </Field>
      </div>
    </Card>
  )
}

function AcademicSettings({ values, onField, onSave, saved, disabled }) {
  const [form, setForm] = useState({
    termStart: '2026-06-01',
    termEnd: '2027-03-31',
    workingDays: 'Monday–Saturday',
    periods: '8',
    periodDuration: '45',
    gradingSystem: 'Percentage',
    passMarks: '35',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Card title="Academic Settings" description="Configure the academic calendar and grading preferences." onSave={onSave} saved={saved} disabled={disabled}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Academic Year">
          <input value={values.academicYear || ''} onChange={(e) => onField('academicYear', e.target.value)} className={inp} />
        </Field>
        <Field label="Term Start Date">
          <input type="date" value={form.termStart} onChange={set('termStart')} className={inp} />
        </Field>
        <Field label="Term End Date">
          <input type="date" value={form.termEnd} onChange={set('termEnd')} className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Working Days">
          <select value={form.workingDays} onChange={set('workingDays')} className={inp}>
            {['Monday–Friday', 'Monday–Saturday'].map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Daily Periods">
          <input type="number" value={form.periods} onChange={set('periods')} className={inp} min="4" max="12" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Period Duration (min)">
          <input type="number" value={form.periodDuration} onChange={set('periodDuration')} className={inp} />
        </Field>
        <Field label="Grading System">
          <select value={form.gradingSystem} onChange={set('gradingSystem')} className={inp}>
            {['Percentage', 'GPA (4.0)', 'Letter Grade (A–F)', 'CGPA (10)'].map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Pass Marks (%)">
          <input type="number" value={form.passMarks} onChange={set('passMarks')} className={inp} min="1" max="100" />
        </Field>
      </div>
    </Card>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-surface px-4 py-3.5">
      <div>
        <p className="text-[14px] font-semibold text-text">{label}</p>
        {description && <p className="mt-0.5 text-[12.5px] text-text-secondary">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200 mt-0.5"
        style={{ background: checked ? '#1C3A28' : '#DDD6CB' }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

function NotificationSettings({ onSave, saved, disabled }) {
  const [prefs, setPrefs] = useState({
    feeReminders: true, attendanceAlerts: true, examNotices: true,
    staffLeave: true, newAdmissions: false, reportGenerated: true,
    parentMessages: false, systemUpdates: true,
  })
  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }))

  const items = [
    { key: 'feeReminders',     label: 'Fee Payment Reminders',     description: 'Alert when fee due dates are approaching' },
    { key: 'attendanceAlerts', label: 'Attendance Alerts',         description: 'Notify when student attendance drops below threshold' },
    { key: 'examNotices',      label: 'Examination Notices',       description: 'Reminders for upcoming exam schedules' },
    { key: 'staffLeave',       label: 'Staff Leave Requests',      description: 'Notify when a teacher submits a leave request' },
    { key: 'newAdmissions',    label: 'New Admissions',            description: 'Alert on each new student registration' },
    { key: 'reportGenerated',  label: 'Report Generation',         description: 'Notify when a report is ready to download' },
    { key: 'parentMessages',   label: 'Parent Messages',           description: 'Incoming messages from parents via the portal' },
    { key: 'systemUpdates',    label: 'System Updates',            description: 'Platform maintenance and feature announcements' },
  ]

  return (
    <Card title="Notification Preferences" description="Choose which events trigger admin notifications." onSave={onSave} saved={saved} disabled={disabled}>
      <div className="space-y-2.5">
        {items.map(({ key, label, description }) => (
          <Toggle key={key} label={label} description={description} checked={prefs[key]} onChange={() => toggle(key)} />
        ))}
      </div>
    </Card>
  )
}

function SecuritySettings({ onSave, saved, disabled }) {
  const [form, setForm] = useState({ currentPw: '', newPw: '', confirmPw: '' })
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Card title="Security" description="Manage admin password, two-factor authentication, and session settings." onSave={onSave} saved={saved} disabled={disabled}>
      <div>
        <p className="mb-3 text-[13.5px] font-semibold text-text">Change Password</p>
        <div className="space-y-3">
          <Field label="Current Password">
            <input type="password" value={form.currentPw} onChange={set('currentPw')} placeholder="Enter current password" className={inp} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="New Password">
              <input type="password" value={form.newPw} onChange={set('newPw')} placeholder="Min 8 characters" className={inp} />
            </Field>
            <Field label="Confirm New Password">
              <input type="password" value={form.confirmPw} onChange={set('confirmPw')} placeholder="Repeat new password" className={inp} />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[13.5px] font-semibold text-text">Access Controls</p>
        <Toggle
          label="Two-Factor Authentication"
          description="Require an OTP on every login from a new device"
          checked={twoFactor}
          onChange={setTwoFactor}
        />
        <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3.5">
          <div>
            <p className="text-[14px] font-semibold text-text">Session Timeout</p>
            <p className="mt-0.5 text-[12.5px] text-text-secondary">Auto-logout after inactivity</p>
          </div>
          <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}
            className="rounded-lg border border-border bg-surface-card px-3 py-1.5 text-[13.5px] text-text focus:border-navy focus:outline-none">
            {['15', '30', '60', '120', '240'].map((v) => (
              <option key={v} value={v}>{v} min</option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  )
}

function AppearanceSettings({ values, onField, onSave, saved, disabled }) {
  const [theme, setTheme] = useState('light')
  const [density, setDensity] = useState('comfortable')
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY')
  const [lang, setLang] = useState('English')

  const currency = values.currency
  const knownCurrencies = ['INR', 'USD', 'EUR', 'GBP']

  return (
    <Card title="Appearance & Preferences" description="Customise display settings, date formats, and locale." onSave={onSave} saved={saved} disabled={disabled}>
      {/* Theme */}
      <div>
        <p className="mb-3 text-[13.5px] font-semibold text-text">Interface Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', preview: ['#FAF7F2', '#1C3A28', '#F4EFE8'] },
            { id: 'dark',  label: 'Dark',  preview: ['#122618', '#C4A15B', '#1C3A28'] },
            { id: 'auto',  label: 'System', preview: ['#F0F0F0', '#333', '#E0E0E0'] },
          ].map(({ id, label, preview }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className="flex flex-col items-center gap-2 rounded-xl border p-3 transition-all"
              style={{
                borderColor: theme === id ? '#1C3A28' : '#DDD6CB',
                background: theme === id ? 'rgba(28,58,40,0.05)' : 'transparent',
              }}
            >
              <div className="flex h-8 w-full rounded-lg overflow-hidden">
                {preview.map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <p className="text-[12.5px] font-semibold text-text">{label}</p>
              {theme === id && (
                <span className="h-1.5 w-1.5 rounded-full bg-navy" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Content Density">
          <select value={density} onChange={(e) => setDensity(e.target.value)} className={inp}>
            {['Compact', 'Comfortable', 'Spacious'].map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Date Format">
          <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={inp}>
            {['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Currency">
          <select value={currency} onChange={(e) => onField('currency', e.target.value)} className={inp}>
            {!currency && <option value="" />}
            {knownCurrencies.map((c) => (
              <option key={c} value={c}>
                {c === 'INR' ? 'INR (₹)' : c === 'USD' ? 'USD ($)' : c === 'EUR' ? 'EUR (€)' : 'GBP (£)'}
              </option>
            ))}
            {currency && !knownCurrencies.includes(currency) && <option value={currency}>{currency}</option>}
          </select>
        </Field>
        <Field label="Language">
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={inp}>
            {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada'].map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
      </div>
    </Card>
  )
}
