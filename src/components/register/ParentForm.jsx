import { useState } from 'react'
import { Users, Mail, User, Phone, CreditCard } from 'lucide-react'
import FormShell from './FormShell.jsx'
import TextInput from '../ui/TextInput.jsx'
import SelectInput from '../ui/SelectInput.jsx'
import PasswordInput from '../ui/PasswordInput.jsx'
import Button from '../ui/Button.jsx'
import { required, isEmail, isPhone, minLength, matches } from '../../lib/validators.js'

const initial = {
  fullName: '',
  relation: '',
  studentId: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function ParentForm({ onBack, onSuccess }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {
      fullName: required(form.fullName, 'Enter the full name.'),
      relation: required(form.relation, 'Select the relation to student.'),
      studentId: required(form.studentId, "Enter the student's ID."),
      phone: isPhone(form.phone),
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
      onSuccess('Parent')
    }, 1000)
  }

  return (
    <FormShell
      title="Parent / guardian registration"
      subtitle="Link your account to your child's academic record."
      icon={Users}
      accent="bg-ink-100 text-ink-600"
      onBack={onBack}
      onSubmit={handleSubmit}
    >
      <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput label="Full name" icon={User} placeholder="Kavita Rao" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
        <SelectInput
          label="Relation to student"
          placeholder="Select relation"
          options={['Mother', 'Father', 'Guardian', 'Grandparent', 'Other']}
          value={form.relation}
          onChange={set('relation')}
          error={errors.relation}
        />
        <TextInput label="Student ID" icon={CreditCard} placeholder="STU-2026-0142" value={form.studentId} onChange={set('studentId')} error={errors.studentId} />
        <TextInput label="Phone number" icon={Phone} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <TextInput label="Email address" icon={Mail} type="email" placeholder="kavita@example.com" value={form.email} onChange={set('email')} error={errors.email} className="sm:col-span-2" />
        <PasswordInput label="Password" placeholder="Create a password" value={form.password} onChange={set('password')} error={errors.password} />
        <PasswordInput label="Confirm password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
      </fieldset>

      <Button type="submit" loading={loading}>
        {loading ? 'Creating account…' : 'Create parent account'}
      </Button>
    </FormShell>
  )
}
