import { supabase, isConfigured, configError } from '../lib/supabase.js'

function toCamel(r) {
  if (!r) return null
  return {
    id: r.id,
    studentId: r.student_id,
    studentName: r.students?.name,
    className: r.students?.class_name,
    type: r.type,
    amount: r.amount,
    dueDate: r.due_date,
    paidDate: r.paid_date,
    status: r.status,
  }
}

function toRow(f) {
  return {
    id: f.id,
    student_id: f.studentId,
    type: f.type,
    amount: f.amount,
    due_date: f.dueDate,
    paid_date: f.paidDate || null,
    status: f.status || 'Pending',
  }
}

const SELECT = '*, students(name, class_name)'

export async function getFees() {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('fees').select(SELECT).order('due_date')
  return { data: data ? data.map(toCamel) : null, error }
}

export async function getFeesForStudent(studentId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('fees').select(SELECT).eq('student_id', studentId).order('due_date')
  return { data: data ? data.map(toCamel) : null, error }
}

export async function markFeePaid(feeId, paidDate) {
  if (!isConfigured) return { error: configError }
  const { error } = await supabase
    .from('fees')
    .update({ status: 'Paid', paid_date: paidDate })
    .eq('id', feeId)
  return { error }
}

export async function upsertFee(fee) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('fees').upsert(toRow(fee)).select(SELECT).single()
  return { data: toCamel(data), error }
}

export async function deleteFee(id) {
  if (!isConfigured) return { error: configError }
  const { error } = await supabase.from('fees').delete().eq('id', id)
  return { error }
}
