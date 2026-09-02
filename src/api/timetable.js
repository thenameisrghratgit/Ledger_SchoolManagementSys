import { supabase, isConfigured } from '../lib/supabase.js'
import { SEED_TIMETABLES } from '../data/timetable.js'

export async function getTimetableForClass(className) {
  if (!isConfigured) return { data: SEED_TIMETABLES[className] || null, error: null }
  const { data, error } = await supabase
    .from('timetable')
    .select('*')
    .eq('class_name', className)
  if (error || !data) return { data: SEED_TIMETABLES[className] || null, error }
  // Reshape flat rows → { [day]: [slot, ...] }
  const shaped = {}
  data.forEach(({ day, period_index, subject, teacher_name }) => {
    if (!shaped[day]) shaped[day] = Array(8).fill(null)
    shaped[day][period_index] = subject ? { s: subject, t: teacher_name } : null
  })
  return { data: shaped, error: null }
}

export async function saveTimetableCell(className, day, periodIndex, subject, teacherName) {
  if (!isConfigured) return { error: null }
  const row = { class_name: className, day, period_index: periodIndex, subject, teacher_name: teacherName }
  const { error } = await supabase.from('timetable').upsert(row, {
    onConflict: 'class_name,day,period_index',
  })
  return { error }
}
