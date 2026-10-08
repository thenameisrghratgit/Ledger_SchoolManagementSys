import { describe, it, expect, vi } from 'vitest'

vi.mock('../../lib/supabase.js', () => ({
  isConfigured: false,
  configError: 'Supabase is not configured. Copy .env.example to .env.',
  supabase: null,
  requireSupabase: () => {
    throw new Error('Supabase is not configured.')
  },
}))

describe('when Supabase env vars are missing', () => {
  it('getStudents returns the config error instead of fake data', async () => {
    const { getStudents } = await import('../students.js')
    const { data, error } = await getStudents()
    expect(data).toBeNull()
    expect(error).toMatch(/not configured/)
  })

  it('saveAttendanceBatch fails loudly without touching data', async () => {
    const { saveAttendanceBatch } = await import('../attendance.js')
    const { error } = await saveAttendanceBatch([
      { studentId: 'STU-1', date: '2026-10-01', status: 'P' },
    ])
    expect(error).toMatch(/not configured/)
  })

  it('getTimetableForClass returns config error, not an empty grid', async () => {
    const { getTimetableForClass } = await import('../timetable.js')
    const { data, error } = await getTimetableForClass('Class 8')
    expect(data).toBeNull()
    expect(error).toMatch(/not configured/)
  })
})
