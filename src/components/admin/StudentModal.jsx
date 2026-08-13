import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Phone, MapPin, Calendar, Users as UsersIcon, GraduationCap, CreditCard, Pencil } from 'lucide-react'
import TextInput from '../ui/TextInput.jsx'
import SelectInput from '../ui/SelectInput.jsx'
import Button from '../ui/Button.jsx'
import { CLASS_OPTIONS, GENDER_OPTIONS, emptyStudent } from '../../data/students.js'

// mode: 'view' | 'add' | 'edit'
export default function StudentModal({ mode, student, onClose, onSave, onEdit }) {
  const [form, setForm] = useState(student || emptyStudent())
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(student || emptyStudent())
    setErrors({})

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [student, mode, onClose])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const req = (v, msg) => (v && String(v).trim() ? '' : msg)
    const next = {
      studentId: req(form.studentId, 'Enter a student ID.'),
      name: req(form.name, "Enter the student's name."),
      dob: req(form.dob, 'Select a date of birth.'),
      gender: req(form.gender, 'Select a gender.'),
      className: req(form.className, 'Select a class.'),
      parentName: req(form.parentName, "Enter the parent's name."),
      contact: req(form.contact, 'Enter a contact number.'),
      address: req(form.address, 'Enter an address.'),
    }
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = onSave({ ...form, studentId: form.studentId.trim() })
    if (result?.ok === false) {
      setErrors((current) => ({ ...current, [result.field]: result.error }))
    }
  }

  const isView = mode === 'view'
  const title = mode === 'add' ? 'Add Student' : mode === 'edit' ? 'Edit Student' : 'Student Details'
  const subtitle = mode === 'add'
    ? 'Enter the new student\u2019s details below.'
    : mode === 'edit'
      ? 'Update the student\u2019s record.'
      : 'Full record on file for this student.'

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface-card shadow-card-hover">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-[17px] font-semibold text-text">{title}</h2>
            <p className="mt-0.5 text-[13.5px] text-text-secondary">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {isView ? (
            <ViewBody student={form} />
          ) : (
            <form id="student-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextInput label="Student ID" icon={CreditCard} placeholder="STU-2026-0142" value={form.studentId} onChange={set('studentId')} error={errors.studentId} disabled={mode === 'edit'} />
              <TextInput label="Name" icon={User} placeholder="Aarav Krishnan" value={form.name} onChange={set('name')} error={errors.name} />
              <TextInput label="Date of birth" icon={Calendar} type="date" value={form.dob} onChange={set('dob')} error={errors.dob} />
              <SelectInput label="Gender" placeholder="Select gender" options={GENDER_OPTIONS} value={form.gender} onChange={set('gender')} error={errors.gender} />
              <SelectInput label="Class" placeholder="Select class" options={CLASS_OPTIONS} value={form.className} onChange={set('className')} error={errors.className} />
              <TextInput label="Section" icon={GraduationCap} placeholder="A" value={form.section} onChange={set('section')} error={errors.section} />
              <TextInput label="Parent name" icon={UsersIcon} placeholder="Suresh Krishnan" value={form.parentName} onChange={set('parentName')} error={errors.parentName} />
              <TextInput label="Contact number" icon={Phone} type="tel" placeholder="+91 98765 43210" value={form.contact} onChange={set('contact')} error={errors.contact} />
              <TextInput className="sm:col-span-2" label="Address" icon={MapPin} placeholder="14, Lake View Road, Chennai" value={form.address} onChange={set('address')} error={errors.address} />
            </form>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          {isView ? (
            <>
              <Button variant="secondary" className="w-auto px-5" onClick={onClose}>Close</Button>
              <Button variant="primary" className="w-auto px-5" onClick={onEdit}>
                <Pencil size={15} /> Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" className="w-auto px-5" onClick={onClose}>Cancel</Button>
              <Button type="submit" form="student-form" variant="primary" className="w-auto px-5">Save Student</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

function ViewBody({ student }) {
  const rows = [
    ['Student ID', student.studentId],
    ['Name', student.name],
    ['Date of birth', student.dob],
    ['Gender', student.gender],
    ['Class', `${student.className || ''}${student.section ? ' - ' + student.section : ''}`],
    ['Parent name', student.parentName],
    ['Contact number', student.contact],
    ['Address', student.address],
  ]
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className={label === 'Address' ? 'sm:col-span-2' : ''}>
          <dt className="text-[12.5px] font-medium text-text-secondary">{label}</dt>
          <dd className="mt-1 text-[14.5px] text-text">{value || '\u2014'}</dd>
        </div>
      ))}
    </dl>
  )
}
