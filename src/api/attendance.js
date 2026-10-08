import { supabase, isConfigured, configError } from '../lib/supabase.js'

function toCamel(r) {
  if (!r) return null
  return {
    id: r.id,
    studentId: r.student_id,
    date: r.date,
    status: r.status,
    notes: r.notes,
    markedBy: r.marked_by,
    studentName: r.students?.name,
    className: r.students?.class_name,
    section: r.students?.section,
  }
}

// Attendance records for a whole class on a date (joined with students)
export async function getAttendanceForClass(className, date) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students!inner(name, class_name, section)')
    .eq('students.class_name', className)
    .eq('date', date)
  return { data: data ? data.map(toCamel) : null, error }
}

// A student's attendance history
export async function getStudentAttendance(studentId, fromDate, toDate) {
  if (!isConfigured) return { data: null, error: configError }
  let q = supabase.from('attendance').select('*').eq('student_id', studentId)
  if (fromDate) q = q.gte('date', fromDate)
  if (toDate) q = q.lte('date', toDate)
  const { data, error } = await q.order('date', { ascending: false })
  return {
    data: data ? data.map((r) => ({ studentId: r.student_id, date: r.date, status: r.status, notes: r.notes })) : null,
    error,
  }
}

// Bulk save/replace attendance for a class on a date.
// records: [{ studentId, date, status, notes?, markedBy? }]
export async function saveAttendanceBatch(records) {
  if (!isConfigured) return { error: configError }
  const rows = records.map((r) => ({
    student_id: r.studentId,
    date: r.date,
    status: r.status,
    notes: r.notes ?? null,
    marked_by: r.markedBy ?? null,
  }))
  const { error } = await supabase.from('attendance').upsert(rows, {
    onConflict: 'student_id,date',
  })
  return { error }
}

// Teacher self-attendance ("mark your attendance" widget)
export async function getTeacherAttendance(teacherId, date) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('teacher_attendance')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('date', date)
    .maybeSingle()
  return { data: data ? { teacherId: data.teacher_id, date: data.date, status: data.status } : null, error }
}

export async function saveTeacherAttendance(teacherId, date, status) {
  if (!isConfigured) return { error: configError }
  const { error } = await supabase
    .from('teacher_attendance')
    .upsert({ teacher_id: teacherId, date, status }, { onConflict: 'teacher_id,date' })
  return { error }
}
