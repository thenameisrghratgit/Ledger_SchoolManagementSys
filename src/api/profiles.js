import { supabase, isConfigured, configError } from '../lib/supabase.js'

function toCamel(p) {
  if (!p) return null
  return {
    id: p.id,
    role: p.role,
    fullName: p.full_name,
    phone: p.phone,
    avatarUrl: p.avatar_url,
    status: p.status,
  }
}

export async function getProfile(userId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return { data: toCamel(data), error }
}

// Profile edits are limited to name/phone/avatar — role and status can only
// be changed by an administrator (enforced by the database)
export async function updateProfile(profile) {
  if (!isConfigured) return { data: null, error: configError }
  const row = {
    id: profile.id,
    full_name: profile.fullName ?? null,
    phone: profile.phone ?? null,
    avatar_url: profile.avatarUrl ?? null,
  }
  const { data, error } = await supabase.from('profiles').upsert(row).select().single()
  return { data: toCamel(data), error }
}

// Link a parent to a student (admin only under RLS)
export async function linkParentStudent(parentId, studentId) {
  if (!isConfigured) return { error: configError }
  const { error } = await supabase
    .from('parent_student')
    .upsert({ parent_id: parentId, student_id: studentId })
  return { error }
}

// Students linked to a parent account (empty array = no linked child)
export async function getChildrenForParent(parentId) {
  if (!isConfigured) return { data: null, error: configError }
  const { data, error } = await supabase
    .from('parent_student')
    .select('relation, students(*)')
    .eq('parent_id', parentId)
  if (error) return { data: null, error }
  const children = (data || []).map((r) => ({
    relation: r.relation,
    studentId: r.students.student_id,
    name: r.students.name,
    className: r.students.class_name,
    section: r.students.section,
    dob: r.students.dob,
    gender: r.students.gender,
    parentName: r.students.parent_name,
    parentContact: r.students.parent_contact,
    contact: r.students.contact,
    address: r.students.address,
  }))
  return { data: children, error: null }
}
