import { supabase, isConfigured } from '../lib/supabase.js'
import { SEED_FEES } from '../data/fees.js'

export async function getFees() {
  if (!isConfigured) return { data: SEED_FEES, error: null }
  const { data, error } = await supabase.from('fees').select('*').order('due_date')
  return { data: data || SEED_FEES, error }
}

export async function getFeesForStudent(studentId) {
  if (!isConfigured) return { data: SEED_FEES.filter((f) => f.studentId === studentId), error: null }
  const { data, error } = await supabase.from('fees').select('*').eq('student_id', studentId).order('due_date')
  return { data: data || [], error }
}

export async function markFeePaid(feeId, paidDate) {
  if (!isConfigured) return { error: null }
  const { error } = await supabase
    .from('fees')
    .update({ status: 'Paid', paid_date: paidDate })
    .eq('id', feeId)
  return { error }
}

export async function upsertFee(fee) {
  if (!isConfigured) return { data: fee, error: null }
  const { data, error } = await supabase.from('fees').upsert(fee).select().single()
  return { data, error }
}
