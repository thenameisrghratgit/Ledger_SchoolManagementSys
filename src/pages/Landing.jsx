import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Users,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Clock,
  Wallet,
  BarChart3,
  Settings as SettingsIcon,
  BookOpen,
  Stamp,
  RefreshCw,
  MessageSquare,
  Zap,
  Leaf,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Play,
  Shield,
  Smartphone,
  Globe,
  TrendingUp,
  ArrowRight,
  Star,
  Award,
  Bell,
  CreditCard,
  ClipboardList,
  School,
} from 'lucide-react'
import SealMark from '../components/SealMark.jsx'
import { SparklesCore } from '../components/ui/Sparkles.jsx'

/* ─── Data ─────────────────────────────────────────────── */

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#compare', label: 'Why Ledgerhall' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#faq', label: 'FAQ' },
]

const trustedSchools = [
  'St. Mary\'s Academy',
  'Delhi Public School',
  'The International School',
  'Green Valley Academy',
  'Sunrise Montessori',
  'Oakridge International',
  'Royal Heritage School',
  'Pioneer Academy',
]

const stats = [
  { value: 500, suffix: '+', label: 'Schools Managed', icon: School },
  { value: 50000, suffix: '+', label: 'Students Tracked', icon: Users },
  { value: 10, suffix: '+', label: 'Powerful Modules', icon: Zap },
  { value: 99.9, suffix: '%', label: 'Uptime Guaranteed', icon: Shield },
]

const impactStats = [
  {
    value: 30,
    suffix: '%',
    label: 'Boost in Admissions',
    description: 'Streamlined enquiry management converts more leads into enrolled students.',
    icon: TrendingUp,
    color: 'bg-gold-50 text-gold-500',
  },
  {
    value: 50,
    suffix: '%',
    label: 'Better Communication',
    description: 'Real-time notifications keep parents, teachers, and admins connected.',
    icon: MessageSquare,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    value: 30,
    suffix: '%',
    label: 'Efficiency Gain',
    description: 'Automate attendance, fees, and exams — save hours every week.',
    icon: Zap,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    value: 100,
    suffix: '%',
    label: 'Paperless Operations',
    description: 'Go digital with registers, report cards, and fee receipts.',
    icon: Leaf,
    color: 'bg-violet-50 text-violet-600',
  },
]

const featureModules = [
  {
    id: 'students',
    name: 'Student Management',
    icon: Users,
    tabLabel: 'Students',
    description:
      'Enrol, edit, and track every student from admission to graduation. Manage personal details, guardians, medical records, and documents — all in one place.',
    highlights: [
      'Digital admission forms with document upload',
      'Complete student profile with history',
      'Guardian & emergency contact management',
      'Transfer certificate generation',
    ],
    sampleData: [
      { id: 'STU-0142', name: 'Aarav Sharma', grade: '10-A', status: 'Active' },
      { id: 'STU-0143', name: 'Priya Iyer', grade: '9-B', status: 'Active' },
      { id: 'STU-0144', name: 'Rohan Menon', grade: '11-C', status: 'Active' },
    ],
  },
  {
    id: 'attendance',
    name: 'Smart Attendance',
    icon: CalendarCheck,
    tabLabel: 'Attendance',
    description:
      'Mark daily attendance in seconds with real-time alerts sent to parents. Generate weekly and monthly reports for any class or student instantly.',
    highlights: [
      'One-tap daily attendance marking',
      'Real-time SMS/push alerts to parents',
      'Biometric integration support',
      'Weekly & monthly attendance reports',
    ],
    sampleData: [
      { cls: '10-A', present: 42, absent: 3, total: 45 },
      { cls: '9-B', present: 38, absent: 2, total: 40 },
      { cls: '11-C', present: 40, absent: 5, total: 45 },
    ],
  },
  {
    id: 'exams',
    name: 'Examinations',
    icon: FileSpreadsheet,
    tabLabel: 'Exams',
    description:
      'Create exams, auto-generate question papers, and publish results with detailed analysis. Support for scholastic and co-scholastic grading.',
    highlights: [
      'Auto test generator from question bank',
      'Detailed result analysis & rank lists',
      'Report card & admit card printing',
      'Scholastic + co-scholastic grading',
    ],
    sampleData: [
      { exam: 'Mid-Term', class: '10', avg: '78%', pass: '94%' },
      { exam: 'Unit Test 2', class: '9', avg: '82%', pass: '97%' },
      { exam: 'Pre-Board', class: '11', avg: '71%', pass: '89%' },
    ],
  },
  {
    id: 'fees',
    name: 'Fee Management',
    icon: Wallet,
    tabLabel: 'Fees',
    description:
      'Collect fees online, generate receipts, and track defaulters automatically. Support for multiple fee categories, concessions, and fine management.',
    highlights: [
      'Online fee collection with receipts',
      'Automatic defaulter tracking & alerts',
      'Bulk fine/concession assignment',
      'Detailed ledger & collection reports',
    ],
    sampleData: [
      { student: 'Aarav Sharma', fee: '₹25,000', paid: '₹25,000', status: 'Paid' },
      { student: 'Priya Iyer', fee: '₹22,500', paid: '₹15,000', status: 'Partial' },
      { student: 'Rohan Menon', fee: '₹25,000', paid: '₹0', status: 'Due' },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: MessageSquare,
    tabLabel: 'Communication',
    description:
      'Send unlimited in-app notifications, SMS alerts, and digital diaries to parents. Keep everyone in the loop about homework, events, and fee reminders.',
    highlights: [
      'Unlimited in-app push notifications',
      'SMS alerts for emergencies & reminders',
      'Digital homework diary for parents',
      'Event calendar & pre-scheduled updates',
    ],
    sampleData: [
      { type: 'SMS', msg: 'PTM scheduled for 15th Sep', to: 'All Parents' },
      { type: 'Push', msg: 'Homework: Math Ch. 5', to: 'Class 10-A' },
      { type: 'Email', msg: 'Fee reminder — 3 days left', to: 'Defaulters' },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    icon: BarChart3,
    tabLabel: 'Reports',
    description:
      'Generate comprehensive reports on students, teachers, fees, and attendance. Export data for staff meetings and board presentations.',
    highlights: [
      'One-click attendance & fee reports',
      'Student performance analytics',
      'Staff workload & subject reports',
      'Export to PDF & Excel formats',
    ],
    sampleData: [
      { report: 'Attendance Summary', period: 'Aug 2026', classes: 'All' },
      { report: 'Fee Collection', period: 'Q2 2026', amount: '₹12.4L' },
      { report: 'Exam Results', period: 'Mid-Term', entries: '214' },
    ],
  },
]

const comparisonData = {
  old: [
    {
      title: 'Manual Processes',
      desc: 'Paper registers, spreadsheets, and files scattered across offices. Hours wasted on repetitive data entry.',
      icon: ClipboardList,
    },
    {
      title: 'Fragmented Communication',
      desc: 'WhatsApp groups, phone calls, and notice boards. Important updates get lost or arrive too late.',
      icon: Bell,
    },
    {
      title: 'Financial Chaos',
      desc: 'Handwritten receipts, manual ledger entries, and endless reconciliations. Tracking fees is a nightmare.',
      icon: CreditCard,
    },
    {
      title: 'Data at Risk',
      desc: 'Files vulnerable to loss, theft, or damage. No backups, no encryption, no audit trail.',
      icon: Shield,
    },
  ],
  new: [
    {
      title: 'Streamlined Efficiency',
      desc: 'One platform to manage admissions, attendance, exams, and fees. Tasks that took hours now take minutes.',
      icon: Zap,
    },
    {
      title: 'Transparent Communication',
      desc: 'Real-time notifications, messaging, and digital diaries keep parents and staff perfectly in sync.',
      icon: MessageSquare,
    },
    {
      title: 'Financial Mastery',
      desc: 'Automated fee collection, defaulter tracking, and detailed financial reports — all at your fingertips.',
      icon: Wallet,
    },
    {
      title: 'Fortified Security',
      desc: 'Advanced encryption, role-based access, and automatic backups keep your school data completely safe.',
      icon: Shield,
    },
  ],
}

const howItWorksSteps = [
  {
    icon: School,
    title: 'Register Your School',
    body: 'Create your school account in under 2 minutes. Add your school name, logo, and basic details to get started instantly.',
    color: 'bg-gold-50 text-gold-500',
  },
  {
    icon: Users,
    title: 'Add Students & Staff',
    body: 'Import existing records or add students one by one. Assign teachers to classes and subjects with a few clicks.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: CalendarCheck,
    title: 'Start Daily Operations',
    body: 'Mark attendance, collect fees, schedule exams, and send notifications — all from a single dashboard.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Track & Improve',
    body: 'View analytics on attendance, fees, and academic performance. Make data-driven decisions for your school.',
    color: 'bg-violet-50 text-violet-600',
  },
]

const testimonials = [
  {
    quote:
      'Ledgerhall has completely transformed how we manage our school. Attendance marking that used to take 20 minutes now takes 2. The parents love the real-time notifications!',
    name: 'Mrs. Kavita Deshmukh',
    role: 'Principal',
    school: 'St. Mary\'s Academy, Pune',
    rating: 5,
  },
  {
    quote:
      'The fee management module alone saved us hundreds of hours. Auto-reminders to defaulters, instant receipts, and detailed reports — it\'s everything we needed.',
    name: 'Mr. Rajesh Kumar',
    role: 'Admin Director',
    school: 'Green Valley International School',
    rating: 5,
  },
  {
    quote:
      'We moved from paper registers to Ledgerhall in one week. The staff adapted instantly because it\'s so intuitive. Best decision our school board has made.',
    name: 'Dr. Sunita Patel',
    role: 'Vice Principal',
    school: 'Delhi Public School, Noida',
    rating: 5,
  },
]

const faqData = [
  {
    q: 'What is school management software?',
    a: 'School management software is a digital platform that automates and streamlines daily school operations — from student admissions and attendance tracking to fee collection, exams, and parent communication. It replaces paper registers and scattered spreadsheets with one unified system.',
  },
  {
    q: 'Is my school data secure on Ledgerhall?',
    a: 'Absolutely. Ledgerhall uses industry-standard encryption for all data at rest and in transit. We provide role-based access controls, automatic daily backups, and a complete audit trail. Your school data is hosted on secure cloud infrastructure with 99.9% uptime.',
  },
  {
    q: 'Can parents track their child\'s progress?',
    a: 'Yes! Parents receive real-time notifications for attendance, homework, fee reminders, and exam results through the app. They can view their child\'s complete academic profile, including attendance history, report cards, and teacher comments.',
  },
  {
    q: 'Does Ledgerhall work on mobile devices?',
    a: 'Ledgerhall is fully responsive and works perfectly on phones, tablets, and desktops. Teachers can mark attendance from their phones, admins can check reports on tablets, and parents can stay updated from anywhere.',
  },
  {
    q: 'How do I get started with Ledgerhall?',
    a: 'Getting started is simple. Click "Register a School," fill in your school details, and you\'re ready to go. You can start adding students, marking attendance, and managing fees within minutes. Our support team is available to help with onboarding.',
  },
  {
    q: 'Which education boards does Ledgerhall support?',
    a: 'Ledgerhall supports all major education boards including CBSE, ICSE, State Boards, and International Baccalaureate (IB). You can customize grading systems, exam patterns, and report card formats to match your board\'s requirements.',
  },
]

const footerProductLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#compare', label: 'Why Ledgerhall' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#faq', label: 'FAQ' },
]

const footerCompanyLinks = [
  { href: '#', label: 'About Us' },
  { href: '#', label: 'Contact' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
]

/* ─── Hooks ────────────────────────────────────────────── */

function useCountUp(end, duration = 2000, startOnView = false, ref = null) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(!startOnView)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!startOnView || !ref?.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [startOnView, ref])

  useEffect(() => {
    if (!hasStarted) return
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(eased * end)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }
    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [hasStarted, end, duration])

  return count
}

/* ─── Section Components ──────────────────────────────── */

function NavBar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-border bg-surface/95 shadow-sm backdrop-blur-md'
          : 'border-transparent bg-surface/80 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-4">
          <motion.div
            className="relative flex-shrink-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Breathing glow ring */}
            <motion.div
              className="absolute -inset-1 rounded-2xl"
              style={{ background: 'radial-gradient(circle, rgba(196,162,91,0.28) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
            />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-deep text-gold-300 shadow-card-hover">
              <SealMark size={38} animate={true} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-serif text-[1.6rem] font-bold leading-tight tracking-tight text-text">
              Ledgerhall
            </span>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
              School Management System
            </p>
          </motion.div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-text-secondary transition-colors hover:text-navy"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-5 py-2.5 text-[15px] font-medium text-text-secondary transition-colors hover:text-navy"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-navy px-6 py-3 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-navy-deep hover:shadow-lg"
          >
            Register Now
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-text transition-colors hover:bg-surface-card md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-card hover:text-text"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-text-secondary"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-navy px-4 py-2.5 text-center text-sm font-medium text-white"
                  onClick={() => setOpen(false)}
                >
                  Register Now
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Hero() {
  const reduceMotion = useReducedMotion()
  const statsRef = useRef(null)

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface to-navy/[0.03]" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/[0.06] blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-navy/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Left: Copy */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-4 py-1.5">
            <Award size={14} className="text-gold-600" />
            <span className="text-xs font-semibold tracking-wide text-gold-700">
              India's AI-Powered School Management System
            </span>
          </div>

          <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.1] tracking-tight text-text md:text-5xl lg:text-[3.25rem]">
            Your School,{' '}
            <span className="text-navy">All in One Place</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
            Manage admissions, attendance, exams, fees, and parent communication
            from a single, intuitive platform. Built for modern schools that
            demand more.
          </p>
        </motion.div>

        {/* Right: Dashboard mockup */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 30 }}
          animate={reduceMotion ? false : { opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mt-12 lg:mt-0"
        >
          <DashboardMockup />
        </motion.div>
      </div>

      {/* Stats bar */}
      <div ref={statsRef} className="relative border-t border-border bg-surface-card/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCounter key={stat.label} stat={stat} index={i} parentRef={statsRef} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCounter({ stat, index, parentRef }) {
  const reduceMotion = useReducedMotion()
  const count = useCountUp(stat.value, 2000, !reduceMotion, parentRef)
  const Icon = stat.icon
  const display =
    stat.value >= 1000
      ? Math.round(count).toLocaleString()
      : stat.value % 1 !== 0
        ? count.toFixed(1)
        : Math.round(count)

  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10">
        <Icon size={20} className="text-navy" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-text">
          {display}
          {stat.suffix}
        </p>
        <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
      </div>
    </div>
  )
}

function DashboardMockup() {
  const sampleRows = [
    { id: 'STU-0142', name: 'Aarav Sharma', grade: '10-A', status: 'Active', attendance: '96%' },
    { id: 'STU-0143', name: 'Priya Iyer', grade: '9-B', status: 'Active', attendance: '92%' },
    { id: 'STU-0144', name: 'Rohan Menon', grade: '11-C', status: 'Active', attendance: '88%' },
    { id: 'STU-0145', name: 'Sneha Gupta', grade: '10-A', status: 'Active', attendance: '94%' },
  ]

  return (
    <div className="relative">
      <SealMark
        size={200}
        animate={false}
        className="pointer-events-none absolute -right-10 -top-10 text-navy/[0.04]"
      />
      <div className="relative rounded-2xl border border-border bg-surface-card p-1 shadow-2xl shadow-navy/10">
        {/* Window chrome */}
        <div className="flex items-center gap-2 rounded-t-xl border-b border-border bg-surface px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-surface-card px-3 py-1 text-[11px] text-text-secondary">
            app.ledgerhall.com/admin/students
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4">
          {/* Top cards */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Total Students', value: '214', color: 'text-navy' },
              { label: 'Today Present', value: '198', color: 'text-emerald-600' },
              { label: 'Fee Collected', value: '₹12.4L', color: 'text-gold-600' },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-border bg-surface p-3"
              >
                <p className="text-[10px] text-text-secondary">{card.label}</p>
                <p className={`mt-0.5 text-lg font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Student Register
              </span>
              <span className="rounded bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-600">
                Term 2, 2026
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-card text-[10px] text-text-secondary">
                  <th className="px-3 py-1.5 font-medium">ID</th>
                  <th className="px-3 py-1.5 font-medium">Name</th>
                  <th className="px-3 py-1.5 font-medium">Grade</th>
                  <th className="px-3 py-1.5 font-medium">Attendance</th>
                  <th className="px-3 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-surface-card/50"
                  >
                    <td className="px-3 py-2 font-medium text-text-secondary">
                      {row.id}
                    </td>
                    <td className="px-3 py-2 font-medium text-text">{row.name}</td>
                    <td className="px-3 py-2 text-text-secondary">{row.grade}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`font-medium ${
                          parseInt(row.attendance) >= 90
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {row.attendance}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-center text-[10px] text-text-secondary">
            4 of 214 entries shown
          </p>
        </div>
      </div>
    </div>
  )
}

function TrustedBy() {
  return (
    <section className="border-b border-border bg-surface-card/30">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Trusted by leading schools across India
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {trustedSchools.map((name) => (
            <span
              key={name}
              className="text-sm font-medium text-text-secondary/60 transition-colors hover:text-text-secondary"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImpactSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-text md:text-4xl">
            The Impact of Going Digital
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Schools using Ledgerhall report measurable improvements across
            admissions, communication, efficiency, and sustainability.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl border border-border bg-surface-card p-6 transition-all hover:border-navy/20 hover:shadow-lg hover:shadow-navy/5"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-text">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="mt-1 text-sm font-semibold text-text">{stat.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {stat.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const TAB_COLORS = [
  { bg: 'linear-gradient(135deg, #2A5C40, #1C3A28)', glow: 'rgba(28,58,40,0.4)',   accent: '#1C3A28' },
  { bg: 'linear-gradient(135deg, #5C8A6A, #3A6B50)', glow: 'rgba(58,107,80,0.4)',  accent: '#3A6B50' },
  { bg: 'linear-gradient(135deg, #C4622D, #A84E1E)', glow: 'rgba(196,98,45,0.4)',  accent: '#C4622D' },
  { bg: 'linear-gradient(135deg, #8A6329, #6B4A1A)', glow: 'rgba(138,99,41,0.45)', accent: '#8A6329' },
  { bg: 'linear-gradient(135deg, #4A6C7A, #2E4F5C)', glow: 'rgba(74,108,122,0.4)', accent: '#4A6C7A' },
  { bg: 'linear-gradient(135deg, #6B4A6B, #4A2E4A)', glow: 'rgba(107,74,107,0.4)', accent: '#6B4A6B' },
]

function FeaturesSection() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const current = featureModules[active]
  const tabRefs = useRef([])
  const [glider, setGlider] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const el = tabRefs.current[active]
    if (el) setGlider({ left: el.offsetLeft, width: el.offsetWidth })
  }, [active])

  // measure on mount
  useEffect(() => {
    const el = tabRefs.current[0]
    if (el) setGlider({ left: el.offsetLeft, width: el.offsetWidth })
  }, [])

  const color = TAB_COLORS[active] || TAB_COLORS[0]

  return (
    <section id="features" className="border-b border-border bg-surface-card/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-text md:text-4xl">
            Everything Your School Needs
          </h2>
          <p className="mt-4 max-w-xl text-text-secondary">
            One powerful platform with modules covering every aspect of school
            management — from student records to financial reporting.
          </p>
        </motion.div>

        {/* Glass glider tab bar */}
        <div className="mt-10 overflow-x-auto pb-2 scrollbar-thin">
          <div className="feature-glass-group">
            {featureModules.map((mod, i) => {
              const Icon = mod.icon
              return (
                <button
                  key={mod.id}
                  ref={el => tabRefs.current[i] = el}
                  onClick={() => setActive(i)}
                  className={`feature-glass-tab${i === active ? ' is-active' : ''}`}
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {mod.tabLabel}
                </button>
              )
            })}
            <div
              className="feature-glass-glider"
              style={{
                left: glider.left,
                width: glider.width,
                background: color.bg,
                boxShadow: `0 0 18px ${color.glow}, inset 0 1px 1px rgba(255,255,255,0.15)`,
              }}
            />
          </div>
        </div>

        {/* Active feature content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? false : { opacity: 1, y: 0 }}
            exit={reduceMotion ? false : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-8 grid gap-8 rounded-2xl border border-border bg-surface-card p-6 md:grid-cols-2 md:p-8"
          >
            {/* Left: Description */}
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: color.accent + '18' }}
                >
                  <current.icon size={20} strokeWidth={1.75} style={{ color: color.accent }} />
                </div>
                <h3 className="font-serif text-xl font-bold" style={{ color: color.accent }}>
                  {current.name}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {current.description}
              </p>
              <ul className="mt-5 space-y-3">
                {current.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: color.accent }}
                    />
                    <span className="text-sm text-text">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Live preview */}
            <div className="flex items-center justify-center">
              <FeaturePreview module={current} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function FeaturePreview({ module }) {
  if (module.id === 'students') {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Student Register
          </span>
          <span className="rounded bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-600">
            Live
          </span>
        </div>
        <div className="space-y-2">
          {module.sampleData.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-text">{row.name}</p>
                <p className="text-[11px] text-text-secondary">
                  {row.id} · {row.grade}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600">
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (module.id === 'attendance') {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Today's Attendance
        </div>
        <div className="space-y-2.5">
          {module.sampleData.map((row) => (
            <div key={row.cls} className="flex items-center gap-3">
              <span className="w-12 text-xs font-medium text-text">{row.cls}</span>
              <div className="flex-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-card">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(row.present / row.total) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-16 text-right text-xs font-medium text-text">
                {row.present}/{row.total}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (module.id === 'exams') {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Exam Overview
        </div>
        <div className="space-y-2">
          {module.sampleData.map((row) => (
            <div
              key={row.exam}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-text">{row.exam}</p>
                <p className="text-[11px] text-text-secondary">Class {row.class}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-navy">{row.avg}</p>
                <p className="text-[10px] text-text-secondary">
                  Pass: {row.pass}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (module.id === 'fees') {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Fee Status
        </div>
        <div className="space-y-2">
          {module.sampleData.map((row) => (
            <div
              key={row.student}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-text">{row.student}</p>
                <p className="text-[11px] text-text-secondary">{row.paid} of {row.fee}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                  row.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-600'
                    : row.status === 'Partial'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-600'
                }`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (module.id === 'communication') {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Recent Notifications
        </div>
        <div className="space-y-2">
          {module.sampleData.map((row, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface-card px-3 py-2.5"
            >
              <div
                className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  row.type === 'SMS'
                    ? 'bg-gold-50 text-gold-500'
                    : row.type === 'Push'
                      ? 'bg-violet-50 text-violet-600'
                      : 'bg-amber-50 text-amber-600'
                }`}
              >
                {row.type}
              </div>
              <div>
                <p className="text-sm text-text">{row.msg}</p>
                <p className="text-[11px] text-text-secondary">To: {row.to}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Reports — default
  return (
    <div className="w-full rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Available Reports
      </div>
      <div className="space-y-2">
        {module.sampleData.map((row) => (
          <div
            key={row.report}
            className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-text">{row.report}</p>
              <p className="text-[11px] text-text-secondary">{row.period}</p>
            </div>
            <BarChart3 size={16} className="text-navy" strokeWidth={1.75} />
          </div>
        ))}
      </div>
    </div>
  )
}

function CompareSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="compare" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-text md:text-4xl">
            Why Schools Love Ledgerhall
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            See how we eliminate the headaches of traditional school management
            and replace them with clarity, speed, and control.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {/* Old way */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={reduceMotion ? false : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border-2 border-red-200/60 bg-red-50/30 p-6 md:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <XCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-serif text-xl font-bold text-text">
                Traditional Approach
              </h3>
            </div>
            <div className="space-y-5">
              {comparisonData.old.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-3.5">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100/80">
                      <Icon size={16} className="text-red-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* New way */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={reduceMotion ? false : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border-2 border-emerald-200/60 bg-emerald-50/30 p-6 md:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
              <h3 className="font-serif text-xl font-bold text-text">
                The Ledgerhall Way
              </h3>
            </div>
            <div className="space-y-5">
              {comparisonData.new.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-3.5">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100/80">
                      <Icon size={16} className="text-emerald-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="how-it-works" className="border-b border-border bg-surface-card/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-text md:text-4xl">
            Get Started in 4 Simple Steps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            From sign-up to full operations in under an hour. No technical
            expertise required.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {i < howItWorksSteps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-px w-full bg-border lg:block" />
                )}
                <div className="relative rounded-2xl border border-border bg-surface-card p-6 transition-all hover:border-navy/20 hover:shadow-lg hover:shadow-navy/5">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${step.color}`}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-text">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="testimonials" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-text md:text-4xl">
            Loved by Schools Everywhere
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Don't take our word for it — hear from the schools and educators
            who transformed their operations with Ledgerhall.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-surface-card p-6 transition-all hover:border-navy/20 hover:shadow-lg hover:shadow-navy/5"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star
                    key={si}
                    size={16}
                    className="fill-gold-400 text-gold-400"
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-text-secondary">
                "{t.quote}"
              </p>

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold text-text">{t.name}</p>
                <p className="text-xs text-text-secondary">
                  {t.role} · {t.school}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)
  const reduceMotion = useReducedMotion()

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section id="faq" className="border-b border-border bg-surface-card/30">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-text md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Everything you need to know about Ledgerhall and school management
            software.
          </p>
        </motion.div>

        <div className="mt-12 space-y-3">
          {faqData.map((faq, i) => (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="overflow-hidden rounded-xl border border-border bg-surface-card"
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-semibold text-text pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-text-secondary transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-5 pb-5 pt-4">
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroSection() {
  const reduceMotion = useReducedMotion()
  const statsRef = useRef(null)

  return (
    <section className="relative overflow-hidden">
      {/* ── Top: green CTA band ── */}
      <div className="relative bg-gradient-to-br from-navy via-navy-deep to-navy">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />
        <SealMark size={340} animate={false} className="pointer-events-none absolute -right-10 -top-10 text-white/[0.05]" />

        {/* Full-cover sparkles layer */}
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={2.0}
          particleDensity={380}
          particleColor="#E8CC8A"
          speed={0.4}
          className="absolute inset-0 w-full h-full"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-36">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="relative z-10 font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Ready to Transform Your School?
            </h2>

            {/* Gradient line accent under heading */}
            <div className="relative z-10 mx-auto mt-3 h-10 w-[32rem] max-w-full">
              <div className="absolute inset-x-16 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-gold-400 to-transparent blur-sm" />
              <div className="absolute inset-x-16 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
              <div className="absolute inset-x-32 top-0 h-[4px] w-1/3 bg-gradient-to-r from-transparent via-gold-300 to-transparent blur-sm" />
            </div>

            <p className="relative z-10 mx-auto mt-2 max-w-xl text-lg text-gold-100/80">
              Join hundreds of schools already using Ledgerhall to streamline their operations.
              Get started free — no credit card required.
            </p>
            <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-4 text-sm font-bold text-navy-deep shadow-lg shadow-gold/20 transition-all hover:bg-gold-300 hover:shadow-xl hover:shadow-gold/30"
              >
                Register Now
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-8 py-4 text-sm font-bold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                Log in to Dashboard
              </Link>
            </div>
            <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-gold-100/60">
              <span className="flex items-center gap-2"><CheckCircle2 size={15} />Free for 30 days</span>
              <span className="flex items-center gap-2"><Shield size={15} />Enterprise-grade security</span>
              <span className="flex items-center gap-2"><Smartphone size={15} />Works on all devices</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Middle: hero copy + mockup ── */}
      <div className="relative bg-gradient-to-br from-surface via-surface to-navy/[0.03]">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/[0.05] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-navy/[0.03] blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-4 py-1.5">
              <Award size={14} className="text-gold-600" />
              <span className="text-xs font-semibold tracking-wide text-gold-700">
                India's AI-Powered School Management System
              </span>
            </div>
            <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.1] tracking-tight text-text md:text-5xl lg:text-[3.25rem]">
              Your School,{' '}
              <span className="text-navy">All in One Place</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
              Manage admissions, attendance, exams, fees, and parent communication
              from a single, intuitive platform. Built for modern schools that demand more.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 30 }}
            animate={reduceMotion ? false : { opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="mt-12 lg:mt-0"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>

      {/* ── Bottom: stats bar ── */}
      <div ref={statsRef} className="border-t border-border bg-surface-card/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCounter key={stat.label} stat={stat} index={i} parentRef={statsRef} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-deep text-gold-300 shadow-card">
                <SealMark size={32} animate={false} />
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-text">
                  Ledgerhall
                </span>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  School Management System
                </p>
              </div>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">
              The modern school management system. Manage admissions,
              attendance, exams, fees, and communication — all from one
              platform.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {['Twitter', 'LinkedIn', 'Facebook'].map((social) => (
                <span
                  key={social}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border text-xs font-medium text-text-secondary transition-all hover:border-navy/30 hover:text-navy"
                >
                  {social[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Product
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {footerProductLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-text-secondary transition-colors hover:text-navy"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Company
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {footerCompanyLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-text-secondary transition-colors hover:text-navy"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Get in Touch
            </p>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
              <li>support@ledgerhall.com</li>
              <li>+91 98765 43210</li>
              <li>
                123 Education Hub
                <br />
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} Ledgerhall. All rights reserved.
          </p>
          <p className="text-xs text-text-secondary">
            Made with ❤️ for schools everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ─────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <NavBar />
      <HeroSection />
      <ImpactSection />
      <FeaturesSection />
      <CompareSection />
      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  )
}
