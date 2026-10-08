import { describe, it, expect } from 'vitest'
import { portalFor } from '../AuthContext.jsx'

describe('portalFor', () => {
  it('maps each role to its portal route', () => {
    expect(portalFor('admin')).toBe('/admin')
    expect(portalFor('student')).toBe('/student')
    expect(portalFor('teacher')).toBe('/teacher')
    expect(portalFor('parent')).toBe('/parent')
  })

  it('falls back to home for unknown roles', () => {
    expect(portalFor(undefined)).toBe('/')
    expect(portalFor('hacker')).toBe('/')
  })
})
