import { supabase, isConfigured, configError } from '../lib/supabase.js'

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function emptyGrid() {
  const grid = {}
  DAYS.forEach((d) => { grid[d] = Array(8).fill(null) })
  return grid
}

// Returns { [day]: Array(8) of { s, t } | null } — period_index 1..8
export async function getTimetableForClass(className) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('timetable')
    .select('*')
    .eq('class_name', className)
  if (error) return { data: null, error }
  const grid = emptyGrid()
  ;(data || []).forEach(({ day, period_index, subject, teacher_name }) => {
    if (!grid[day]) return
    grid[day][period_index - 1] = subject ? { s: subject, t: teacher_name } : null
  })
  return { data: grid, error: null }
}

// periodIndex is 1-based. Pass subject=null to clear the cell (row is deleted).
export async function saveTimetableCell(className, day, periodIndex, subject, teacherName) {
  if (!isConfigured) return { error: configError }
  if (!subject) {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('class_name', className)
      .eq('day', day)
      .eq('period_index', periodIndex)
    return { error }
  }
  const row = {
    class_name: className,
    day,
    period_index: periodIndex,
    subject,
    teacher_name: teacherName || null,
  }
  const { error } = await supabase.from('timetable').upsert(row, {
    onConflict: 'class_name,day,period_index',
  })
  return { error }
}
