import { supabase, isConfigured, configError } from '../lib/supabase.js'

function toCamel(r) {
  if (!r) return null
  return {
    teacherId: r.teacher_id,
    authId: r.auth_id,
    name: r.name,
    department: r.department,
    qualification: r.qualification,
    subjects: r.subjects || [],
    contact: r.contact,
    email: r.email,
    experience: r.experience,
    classes: r.classes,
    status: r.status,
  }
}

function toRow(t) {
  const row = {
    teacher_id: t.teacherId,
    name: t.name,
    department: t.department ?? null,
    qualification: t.qualification ?? null,
    subjects: Array.isArray(t.subjects) ? t.subjects : [],
    contact: t.contact ?? null,
    email: t.email ?? null,
    experience: t.experience ?? null,
    classes: t.classes ?? null,
    status: t.status || 'Active',
  }
  if (t.authId) row.auth_id = t.authId
  return row
}

export async function getTeachers() {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('teachers').select('*').order('name')
  return { data: data ? data.map(toCamel) : null, error }
}

export async function getTeacherById(teacherId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('teachers').select('*').eq('teacher_id', teacherId).maybeSingle()
  return { data: toCamel(data), error }
}

export async function getTeacherByAuthId(authId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('teachers').select('*').eq('auth_id', authId).maybeSingle()
  return { data: toCamel(data), error }
}

export async function upsertTeacher(teacher) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('teachers').upsert(toRow(teacher)).select().single()
  return { data: toCamel(data), error }
}

export async function deleteTeacher(teacherId) {
  if (!isConfigured) return { error: configError }
  const { error } = await supabase.from('teachers').delete().eq('teacher_id', teacherId)
  return { error }
}

// Row update without insert semantics — used by the teacher's own profile
export async function updateOwnTeacher(teacher) {
  if (!isConfigured) return { data: null, error: configError }
  const row = { ...toRow(teacher) }
  delete row.auth_id
  delete row.status
  const { data, error } = await supabase
    .from('teachers')
    .update(row)
    .eq('teacher_id', teacher.teacherId)
    .select()
    .single()
  return { data: toCamel(data), error }
}
