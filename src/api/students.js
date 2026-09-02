import { supabase, isConfigured } from '../lib/supabase.js'
import { SEED_STUDENTS } from '../data/students.js'

export async function getStudents() {
  if (!isConfigured) return { data: SEED_STUDENTS, error: null }
  const { data, error } = await supabase.from('students').select('*').order('name')
  return { data: data || SEED_STUDENTS, error }
}

export async function getStudentByAuthId(authId) {
  if (!isConfigured) return { data: SEED_STUDENTS[0], error: null }
  const { data, error } = await supabase.from('students').select('*').eq('auth_id', authId).single()
  return { data, error }
}

export async function upsertStudent(student) {
  if (!isConfigured) return { data: student, error: null }
  const { data, error } = await supabase.from('students').upsert(student).select().single()
  return { data, error }
}

export async function deleteStudent(studentId) {
  if (!isConfigured) return { error: null }
  const { error } = await supabase.from('students').delete().eq('student_id', studentId)
  return { error }
}
