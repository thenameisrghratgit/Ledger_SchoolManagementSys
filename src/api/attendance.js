import { supabase, isConfigured } from '../lib/supabase.js'

// Returns attendance records for a class on a date
export async function getAttendance(className, date) {
  if (!isConfigured) return { data: [], error: null }
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_name', className)
    .eq('date', date)
  return { data: data || [], error }
}

// Returns a student's attendance history
export async function getStudentAttendance(studentId, fromDate, toDate) {
  if (!isConfigured) return { data: [], error: null }
  let q = supabase.from('attendance').select('*').eq('student_id', studentId)
  if (fromDate) q = q.gte('date', fromDate)
  if (toDate)   q = q.lte('date', toDate)
  const { data, error } = await q.order('date', { ascending: false })
  return { data: data || [], error }
}

// Upsert a batch of attendance records for a class
export async function saveAttendanceBatch(records) {
  if (!isConfigured) return { error: null }
  const { error } = await supabase.from('attendance').upsert(records, {
    onConflict: 'student_id,date',
  })
  return { error }
}
