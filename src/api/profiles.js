import { supabase, isConfigured } from '../lib/supabase.js'

export async function getProfile(userId) {
  if (!isConfigured) return { data: null, error: null }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return { data, error }
}

export async function upsertProfile(profile) {
  if (!isConfigured) return { data: profile, error: null }
  const { data, error } = await supabase.from('profiles').upsert(profile).select().single()
  return { data, error }
}

// Link a parent to a student
export async function linkParentStudent(parentId, studentId) {
  if (!isConfigured) return { error: null }
  const { error } = await supabase.from('parent_student').upsert({ parent_id: parentId, student_id: studentId })
  return { error }
}

export async function getChildrenForParent(parentId) {
  if (!isConfigured) return { data: [], error: null }
  const { data, error } = await supabase
    .from('parent_student')
    .select('students(*)')
    .eq('parent_id', parentId)
  return { data: data?.map((r) => r.students) || [], error }
}
