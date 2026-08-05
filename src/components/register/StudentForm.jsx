import { useState } from 'react'
import { GraduationCap, Mail, User, Phone, CreditCard, Calendar } from 'lucide-react'
import FormShell from './FormShell.jsx'
import TextInput from '../ui/TextInput.jsx'
import SelectInput from '../ui/SelectInput.jsx'
import PasswordInput from '../ui/PasswordInput.jsx'
import FileUpload from '../ui/FileUpload.jsx'
import Button from '../ui/Button.jsx'
import { required, isEmail, isPhone, minLength, matches } from '../../lib/validators.js'

const initial = {
  firstName: '',
  lastName: '',
  studentId: '',
  rollNumber: '',
  className: '',
  section: '',
  dob: '',
  gender: '',
  phone: '',
  parentName: '',
  parentPhone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function StudentForm({ onBack, onSuccess }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {
      firstName: required(form.firstName, 'Enter the first name.'),
      lastName: required(form.lastName, 'Enter the last name.'),
      studentId: required(form.studentId, 'Enter a student ID.'),
      rollNumber: required(form.rollNumber, 'Enter a roll number.'),
      className: required(form.className, 'Select a class.'),
      section: required(form.section, 'Select a section.'),
      dob: required(form.dob, 'Select a date of birth.'),
      gender: required(form.gender, 'Select a gender.'),
      phone: isPhone(form.phone),
      parentName: required(form.parentName, "Enter a parent or guardian's name."),
      parentPhone: isPhone(form.parentPhone),
      email: isEmail(form.email),
      password: minLength(form.password, 8, 'Password must be at least 8 characters.'),
      confirmPassword: matches(form.confirmPassword, form.password),
    }
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSuccess('Student')
    }, 1000)
  }

  return (
    <FormShell
      title="Student registration"
      subtitle="Tell us a little about the student joining Ledgerhall."
      icon={GraduationCap}
      accent="bg-royal-100 text-royal-600"
      onBack={onBack}
      onSubmit={handleSubmit}
    >
      <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput label="First name" icon={User} placeholder="Aanya" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
        <TextInput label="Last name" icon={User} placeholder="Sharma" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
        <TextInput label="Student ID" icon={CreditCard} placeholder="STU-2026-0142" value={form.studentId} onChange={set('studentId')} error={errors.studentId} />
        <TextInput label="Roll number" icon={CreditCard} placeholder="24" value={form.rollNumber} onChange={set('rollNumber')} error={errors.rollNumber} />
        <SelectInput
          label="Class"
          placeholder="Select class"
          options={['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
          value={form.className}
          onChange={set('className')}
          error={errors.className}
        />
        <SelectInput
          label="Section"
          placeholder="Select section"
          options={['A', 'B', 'C', 'D']}
          value={form.section}
          onChange={set('section')}
          error={errors.section}
        />
        <TextInput label="Date of birth" icon={Calendar} type="date" value={form.dob} onChange={set('dob')} error={errors.dob} />
        <SelectInput
          label="Gender"
          placeholder="Select gender"
          options={['Female', 'Male', 'Other', 'Prefer not to say']}
          value={form.gender}
          onChange={set('gender')}
          error={errors.gender}
        />
        <TextInput label="Phone number" icon={Phone} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <TextInput label="Parent / guardian name" icon={User} placeholder="Rohan Sharma" value={form.parentName} onChange={set('parentName')} error={errors.parentName} />
        <TextInput label="Parent / guardian phone" icon={Phone} type="tel" placeholder="+91 98765 00000" value={form.parentPhone} onChange={set('parentPhone')} error={errors.parentPhone} />
        <TextInput label="Email address" icon={Mail} type="email" placeholder="aanya@ledgerhall.edu" value={form.email} onChange={set('email')} error={errors.email} />
        <PasswordInput label="Password" placeholder="Create a password" value={form.password} onChange={set('password')} error={errors.password} />
        <PasswordInput label="Confirm password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
      </fieldset>

      <FileUpload label="Profile picture" />

      <Button type="submit" loading={loading}>
        {loading ? 'Creating account…' : 'Create student account'}
      </Button>
    </FormShell>
  )
}
