import { supabase, isConfigured, configError } from '../lib/supabase.js'

function toCamel(r) {
  if (!r) return null
  return {
    schoolName: r.school_name,
    address: r.address,
    phone: r.phone,
    email: r.email,
    academicYear: r.academic_year,
    currency: r.currency,
  }
}

function toRow(s) {
  return {
    id: 1,
    school_name: s.schoolName ?? null,
    address: s.address ?? null,
    phone: s.phone ?? null,
    email: s.email ?? null,
    academic_year: s.academicYear ?? null,
    currency: s.currency || 'INR',
  }
}

export async function getSettings() {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('school_settings').select('*').eq('id', 1).maybeSingle()
  return { data: toCamel(data), error }
}

export async function updateSettings(settings) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('school_settings').upsert(toRow(settings)).select().single()
  return { data: toCamel(data), error }
}
