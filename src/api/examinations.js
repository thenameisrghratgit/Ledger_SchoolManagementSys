import { supabase, isConfigured } from '../lib/supabase.js'
import { SEED_EXAMS } from '../data/examinations.js'

export async function getExams() {
  if (!isConfigured) return { data: SEED_EXAMS, error: null }
  const { data, error } = await supabase.from('examinations').select('*').order('date')
  return { data: data || SEED_EXAMS, error }
}

export async function getExamsForClass(className) {
  if (!isConfigured) return { data: SEED_EXAMS.filter((e) => e.className === className), error: null }
  const { data, error } = await supabase.from('examinations').select('*').eq('class_name', className).order('date')
  return { data: data || [], error }
}

export async function upsertExam(exam) {
  if (!isConfigured) return { data: exam, error: null }
  const { data, error } = await supabase.from('examinations').upsert(exam).select().single()
  return { data, error }
}

export async function deleteExam(id) {
  if (!isConfigured) return { error: null }
  const { error } = await supabase.from('examinations').delete().eq('id', id)
  return { error }
}

// Results
export async function getResultsForStudent(studentId) {
  if (!isConfigured) return { data: [], error: null }
  const { data, error } = await supabase
    .from('exam_results')
    .select('*, examinations(*)')
    .eq('student_id', studentId)
  return { data: data || [], error }
}

export async function upsertResult(result) {
  if (!isConfigured) return { data: result, error: null }
  const { data, error } = await supabase.from('exam_results').upsert(result).select().single()
  return { data, error }
}
