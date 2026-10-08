import { useState } from 'react'
import { Presentation, Mail, User, Phone, CreditCard, BookOpen, AlertCircle } from 'lucide-react'
import FormShell from './FormShell.jsx'
import TextInput from '../ui/TextInput.jsx'
import SelectInput from '../ui/SelectInput.jsx'
import PasswordInput from '../ui/PasswordInput.jsx'
import FileUpload from '../ui/FileUpload.jsx'
import Button from '../ui/Button.jsx'
import { required, isEmail, isPhone, minLength, matches } from '../../lib/validators.js'
import { friendlyError } from '../../lib/errors.js'
import { useAuth } from '../../context/AuthContext.jsx'

const initial = {
  fullName: '',
  employeeId: '',
  department: '',
  qualification: '',
  subject: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function TeacherForm({ onBack, onSuccess }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {
      fullName: required(form.fullName, 'Enter the full name.'),
      employeeId: required(form.employeeId, 'Enter an employee ID.'),
      department: required(form.department, 'Select a department.'),
      qualification: required(form.qualification, 'Enter the highest qualification.'),
      subject: required(form.subject, 'Enter the subject taught.'),
      phone: isPhone(form.phone),
      email: isEmail(form.email),
      password: minLength(form.password, 8, 'Password must be at least 8 characters.'),
      confirmPassword: matches(form.confirmPassword, form.password),
    }
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setLoading(true)
    const meta = {
      role: 'teacher',
      teacher_id: form.employeeId.trim(),
      full_name: form.fullName.trim(),
      department: form.department,
      qualification: form.qualification.trim(),
      subjects: form.subject.trim(),
      contact: form.phone.trim(),
      email: form.email.trim(),
    }
    try {
      const result = await register(form.email.trim(), form.password, meta)
      if (result.ok) {
        onSuccess('Teacher', { needsVerification: !!result.needsVerification })
      } else {
        setFormError(friendlyError(result.error))
      }
    } catch (err) {
      setFormError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormShell
      title="Teacher registration"
      subtitle="Set up a faculty profile for the staff directory."
      icon={Presentation}
      accent="bg-gold-100 text-gold-600"
      onBack={onBack}
      onSubmit={handleSubmit}
    >
      <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput label="Full name" icon={User} placeholder="Meera Iyer" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
        <TextInput label="Employee ID" icon={CreditCard} placeholder="EMP-2026-0089" value={form.employeeId} onChange={set('employeeId')} error={errors.employeeId} />
        <SelectInput
          label="Department"
          placeholder="Select department"
          options={['Science', 'Mathematics', 'Languages', 'Social Studies', 'Arts', 'Physical Education', 'Computer Science']}
          value={form.department}
          onChange={set('department')}
          error={errors.department}
        />
        <TextInput label="Qualification" icon={BookOpen} placeholder="M.Sc, B.Ed" value={form.qualification} onChange={set('qualification')} error={errors.qualification} />
        <TextInput label="Subject" icon={BookOpen} placeholder="Physics" value={form.subject} onChange={set('subject')} error={errors.subject} />
        <TextInput label="Phone number" icon={Phone} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <TextInput label="Email address" icon={Mail} type="email" placeholder="meera@ledgerhall.edu" value={form.email} onChange={set('email')} error={errors.email} className="sm:col-span-2" />
        <PasswordInput label="Password" placeholder="Create a password" value={form.password} onChange={set('password')} error={errors.password} />
        <PasswordInput label="Confirm password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
      </fieldset>

      <FileUpload label="Profile picture" />

      {formError && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {formError}
        </p>
      )}

      <Button type="submit" loading={loading}>
        {loading ? 'Creating account…' : 'Create teacher account'}
      </Button>
    </FormShell>
  )
}
