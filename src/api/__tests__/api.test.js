import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/supabase.js', () => {
  const state = { calls: [], result: { data: null, error: null } }
  const builder = (ctx) => {
    const b = {
      select: (...a) => (ctx.push(['select', ...a]), b),
      eq: (...a) => (ctx.push(['eq', ...a]), b),
      order: (...a) => (ctx.push(['order', ...a]), b),
      gte: (...a) => (ctx.push(['gte', ...a]), b),
      lte: (...a) => (ctx.push(['lte', ...a]), b),
      upsert: (...a) => (ctx.push(['upsert', ...a]), b),
      update: (...a) => (ctx.push(['update', ...a]), b),
      delete: (...a) => (ctx.push(['delete', ...a]), b),
      maybeSingle: () => (ctx.push(['maybeSingle']), b),
      single: () => (ctx.push(['single']), b),
      then: (onFulfilled, onRejected) =>
        Promise.resolve(state.result).then(onFulfilled, onRejected),
    }
    return b
  }
  return {
    isConfigured: true,
    configError: null,
    requireSupabase: () => ({}),
    supabase: {
      from: (table) => {
        const ctx = [['from', table]]
        state.calls.push(ctx)
        return builder(ctx)
      },
    },
    __state: state,
  }
})

const MODULES = {
  'students.js': () => import('../students.js'),
  'attendance.js': () => import('../attendance.js'),
  'timetable.js': () => import('../timetable.js'),
}

async function load(mod) {
  const lib = await import('../../lib/supabase.js')
  const api = await MODULES[mod]()
  return { api, state: lib.__state }
}

beforeEach(async () => {
  const lib = await import('../../lib/supabase.js')
  lib.__state.calls.length = 0
  lib.__state.result = { data: null, error: null }
})

describe('students api', () => {
  it('getStudents maps snake_case rows to camelCase', async () => {
    const { api, state } = await load('students.js')
    state.result = {
      data: [
        {
          student_id: 'STU-1',
          auth_id: 'a1',
          name: 'Asha',
          email: 'a@x.in',
          roll_number: '07',
          dob: '2011-01-01',
          gender: 'Female',
          class_name: 'Class 8',
          section: 'B',
          parent_name: 'Ravi',
          parent_contact: '+91 1',
          contact: '+91 2',
          address: 'Addr',
          status: 'Active',
        },
      ],
      error: null,
    }
    const { data, error } = await api.getStudents()
    expect(error).toBeNull()
    expect(data[0]).toEqual({
      studentId: 'STU-1',
      authId: 'a1',
      name: 'Asha',
      email: 'a@x.in',
      rollNumber: '07',
      dob: '2011-01-01',
      gender: 'Female',
      className: 'Class 8',
      section: 'B',
      parentName: 'Ravi',
      parentContact: '+91 1',
      contact: '+91 2',
      address: 'Addr',
      status: 'Active',
    })
    expect(state.calls[0][0]).toEqual(['from', 'students'])
  })

  it('getStudents returns null data when the query errors', async () => {
    const { api, state } = await load('students.js')
    state.result = { data: null, error: { message: 'boom' } }
    const { data, error } = await api.getStudents()
    expect(data).toBeNull()
    expect(error.message).toBe('boom')
  })

  it('upsertStudent sends snake_case row and defaults status to Active', async () => {
    const { api, state } = await load('students.js')
    state.result = { data: { student_id: 'STU-2' }, error: null }
    await api.upsertStudent({ studentId: 'STU-2', name: 'Kabir', className: 'Class 7', section: 'A' })
    const upsert = state.calls[0].find((c) => c[0] === 'upsert')
    const row = upsert[1]
    expect(row.status).toBe('Active')
    expect(row.auth_id).toBeUndefined()
    expect(row.class_name).toBe('Class 7')
  })

  it('updateOwnStudent omits auth_id and status from the payload', async () => {
    const { api, state } = await load('students.js')
    state.result = { data: { student_id: 'STU-1' }, error: null }
    await api.updateOwnStudent({
      studentId: 'STU-1',
      name: 'Asha',
      className: 'Class 8',
      section: 'B',
      authId: 'should-not-send',
      status: 'Inactive',
    })
    const row = state.calls[0].find((c) => c[0] === 'update')[1]
    expect(row.auth_id).toBeUndefined()
    expect(row.status).toBeUndefined()
    expect(row.name).toBe('Asha')
  })
})

describe('attendance api', () => {
  it('getAttendanceForClass joins student name/class/section', async () => {
    const { api, state } = await load('attendance.js')
    state.result = {
      data: [
        {
          id: 'x',
          student_id: 'STU-1',
          date: '2026-10-01',
          status: 'P',
          notes: null,
          marked_by: 'admin-1',
          students: { name: 'Asha', class_name: 'Class 8', section: 'B' },
        },
      ],
      error: null,
    }
    const { data } = await api.getAttendanceForClass('Class 8', '2026-10-01')
    expect(data[0]).toMatchObject({
      studentId: 'STU-1',
      studentName: 'Asha',
      className: 'Class 8',
      section: 'B',
      status: 'P',
    })
    const sel = state.calls[0].find((c) => c[0] === 'select')
    expect(sel[1]).toContain('students!inner')
  })

  it('getStudentAttendance filters by date range and sorts newest first', async () => {
    const { api, state } = await load('attendance.js')
    state.result = { data: [], error: null }
    await api.getStudentAttendance('STU-1', '2026-09-01', '2026-09-30')
    const ops = state.calls[0].map((c) => c[0])
    expect(ops).toEqual(
      expect.arrayContaining(['from', 'select', 'eq', 'gte', 'lte', 'order']),
    )
  })

  it('saveAttendanceBatch maps camelCase records to snake_case rows', async () => {
    const { api, state } = await load('attendance.js')
    state.result = { error: null }
    const { error } = await api.saveAttendanceBatch([
      { studentId: 'STU-1', date: '2026-10-01', status: 'A', notes: 'n', markedBy: 'admin-1' },
    ])
    expect(error).toBeNull()
    const upsert = state.calls[0].find((c) => c[0] === 'upsert')
    expect(upsert[1]).toEqual([
      { student_id: 'STU-1', date: '2026-10-01', status: 'A', notes: 'n', marked_by: 'admin-1' },
    ])
    expect(upsert[2]).toEqual({ onConflict: 'student_id,date' })
  })

  it('saveTeacherAttendance upserts on teacher_id+date', async () => {
    const { api, state } = await load('attendance.js')
    state.result = { error: null }
    await api.saveTeacherAttendance('TCH-004', '2026-10-07', 'P')
    const upsert = state.calls[0].find((c) => c[0] === 'upsert')
    expect(upsert[1]).toEqual({ teacher_id: 'TCH-004', date: '2026-10-07', status: 'P' })
    expect(upsert[2]).toEqual({ onConflict: 'teacher_id,date' })
  })
})

describe('timetable api', () => {
  it('builds a 6-day grid with 1-based period indexing', async () => {
    const { api, state } = await load('timetable.js')
    state.result = {
      data: [
        { day: 'Monday', period_index: 1, subject: 'Mathematics', teacher_name: 'Ms. Rao' },
        { day: 'Saturday', period_index: 8, subject: 'Games', teacher_name: 'Mr. Singh' },
        { day: 'NotADay', period_index: 2, subject: 'Ghost', teacher_name: 'X' },
      ],
      error: null,
    }
    const { data, error } = await api.getTimetableForClass('Class 8')
    expect(error).toBeNull()
    expect(Object.keys(data)).toHaveLength(6)
    expect(data.Monday).toHaveLength(8)
    expect(data.Monday[0]).toEqual({ s: 'Mathematics', t: 'Ms. Rao' })
    expect(data.Saturday[7]).toEqual({ s: 'Games', t: 'Mr. Singh' })
    expect(data.Monday[1]).toBeNull()
    expect(data.NotADay).toBeUndefined()
  })

  it('saveTimetableCell upserts with class+day+period conflict key', async () => {
    const { api, state } = await load('timetable.js')
    state.result = { error: null }
    await api.saveTimetableCell('Class 8', 'Monday', 3, 'Science', 'Dr. P')
    const upsert = state.calls[0].find((c) => c[0] === 'upsert')
    expect(upsert[1]).toEqual({
      class_name: 'Class 8',
      day: 'Monday',
      period_index: 3,
      subject: 'Science',
      teacher_name: 'Dr. P',
    })
    expect(upsert[2]).toEqual({ onConflict: 'class_name,day,period_index' })
  })

  it('saveTimetableCell with null subject deletes the row', async () => {
    const { api, state } = await load('timetable.js')
    state.result = { error: null }
    await api.saveTimetableCell('Class 8', 'Monday', 3, null, null)
    const ops = state.calls[0].map((c) => c[0])
    expect(ops).toContain('delete')
    expect(ops).not.toContain('upsert')
    expect(state.calls[0].some((c) => c[0] === 'eq' && c[2] === 3)).toBe(true)
  })
})
