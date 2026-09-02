import { supabase, isConfigured } from '../lib/supabase.js'
import { SEED_TEACHERS } from '../data/teachers.js'

export async function getTeachers() {
  if (!isConfigured) return { data: SEED_TEACHERS, error: null }
  const { data, error } = await supabase.from('teachers').select('*').order('name')
  return { data: data || SEED_TEACHERS, error }
}

export async function getTeacherByAuthId(authId) {
  if (!isConfigured) return { data: SEED_TEACHERS[0], error: null }
  const { data, error } = await supabase.from('teachers').select('*').eq('auth_id', authId).single()
  return { data, error }
}

export async function upsertTeacher(teacher) {
  if (!isConfigured) return { data: teacher, error: null }
  const { data, error } = await supabase.from('teachers').upsert(teacher).select().single()
  return { data, error }
}

export async function deleteTeacher(teacherId) {
  if (!isConfigured) return { error: null }
  const { error } = await supabase.from('teachers').delete().eq('teacher_id', teacherId)
  return { error }
}
