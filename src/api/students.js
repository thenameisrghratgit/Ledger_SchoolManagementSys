import { supabase, isConfigured, configError } from '../lib/supabase.js'

function toCamel(r) {
  if (!r) return null
  return {
    studentId: r.student_id,
    authId: r.auth_id,
    name: r.name,
    email: r.email,
    rollNumber: r.roll_number,
    dob: r.dob,
    gender: r.gender,
    className: r.class_name,
    section: r.section,
    parentName: r.parent_name,
    parentContact: r.parent_contact,
    contact: r.contact,
    address: r.address,
    status: r.status,
  }
}

function toRow(s) {
  const row = {
    student_id: s.studentId,
    name: s.name,
    email: s.email ?? null,
    roll_number: s.rollNumber ?? null,
    dob: s.dob || null,
    gender: s.gender || null,
    class_name: s.className,
    section: s.section,
    parent_name: s.parentName ?? null,
    parent_contact: s.parentContact ?? null,
    contact: s.contact ?? null,
    address: s.address ?? null,
    status: s.status || 'Active',
  }
  if (s.authId) row.auth_id = s.authId
  return row
}

export async function getStudents() {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('students').select('*').order('name')
  return { data: data ? data.map(toCamel) : null, error }
}

export async function getStudentById(studentId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('students').select('*').eq('student_id', studentId).maybeSingle()
  return { data: toCamel(data), error }
}

export async function getStudentByAuthId(authId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('students').select('*').eq('auth_id', authId).maybeSingle()
  return { data: toCamel(data), error }
}

export async function upsertStudent(student) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('students').upsert(toRow(student)).select().single()
  return { data: toCamel(data), error }
}

export async function deleteStudent(studentId) {
  if (!isConfigured) return { error: configError }
  const { error } = await supabase.from('students').delete().eq('student_id', studentId)
  return { error }
}

// Row update without insert semantics — used by the student's own profile
// page (RLS only allows updating your own row; the DB trigger restricts
// which fields may change)
export async function updateOwnStudent(student) {
  if (!isConfigured) return { data: null, error: configError }
  const row = { ...toRow(student) }
  delete row.auth_id
  delete row.status
  const { data, error } = await supabase
    .from('students')
    .update(row)
    .eq('student_id', student.studentId)
    .select()
    .single()
  return { data: toCamel(data), error }
}
