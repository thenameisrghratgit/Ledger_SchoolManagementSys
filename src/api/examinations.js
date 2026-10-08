import { supabase, isConfigured, configError } from '../lib/supabase.js'

function toCamel(r) {
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    subject: r.subject,
    className: r.class_name,
    date: r.date,
    time: r.time,
    duration: r.duration,
    room: r.room,
    maxMarks: r.max_marks,
    status: r.status,
  }
}

function toRow(e) {
  return {
    id: e.id,
    name: e.name,
    type: e.type,
    subject: e.subject,
    class_name: e.className,
    date: e.date,
    time: e.time ?? null,
    duration: e.duration ?? null,
    room: e.room ?? null,
    max_marks: e.maxMarks ?? 100,
    status: e.status || 'Upcoming',
  }
}

function resultToCamel(r) {
  if (!r) return null
  return {
    id: r.id,
    examId: r.exam_id,
    studentId: r.student_id,
    marks: r.marks,
    grade: r.grade,
    remarks: r.remarks,
    exam: r.examinations ? toCamel(r.examinations) : undefined,
    studentName: r.students?.name,
    className: r.students?.class_name,
  }
}

export async function getExams() {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('examinations').select('*').order('date')
  return { data: data ? data.map(toCamel) : null, error }
}

export async function getExamsForClass(className) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('examinations').select('*').eq('class_name', className).order('date')
  return { data: data ? data.map(toCamel) : null, error }
}

export async function upsertExam(exam) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('examinations').upsert(toRow(exam)).select().single()
  return { data: toCamel(data), error }
}

export async function deleteExam(id) {
  if (!isConfigured) return { error: configError }
  const { error } = await supabase.from('examinations').delete().eq('id', id)
  return { error }
}

// Results for one student (with exam details)
export async function getResultsForStudent(studentId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('exam_results')
    .select('*, examinations(*)')
    .eq('student_id', studentId)
  return { data: data ? data.map(resultToCamel) : null, error }
}

// Results for one exam, joined with student names (teacher / reports)
export async function getResultsForExam(examId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('exam_results')
    .select('*, students(name, class_name, section)')
    .eq('exam_id', examId)
  return { data: data ? data.map(resultToCamel) : null, error }
}

// All results joined with students + exams (admin reports)
export async function getAllResults() {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('exam_results')
    .select('*, students(name, class_name, section), examinations(name, subject, max_marks, class_name, date)')
  return { data: data ? data.map(resultToCamel) : null, error }
}

// result: { examId, studentId, marks, grade?, remarks? }
export async function upsertResult(result) {
  if (!isConfigured) return { data: null, error: configError }
  const row = {
    exam_id: result.examId,
    student_id: result.studentId,
    marks: result.marks ?? null,
    grade: result.grade ?? null,
    remarks: result.remarks ?? null,
  }
  const { data, error } = await supabase.from('exam_results').upsert(row, {
    onConflict: 'exam_id,student_id',
  }).select().single()
  return { data: resultToCamel(data), error }
}
