import { describe, expect, it } from 'vitest'
import { formatTime } from './formatTime'

describe('formatTime', () => {
  it('carries rounded seconds into minutes', () => {
    expect(formatTime(59999)).toBe('1:00.00')
    expect(formatTime(59994)).toBe('0:59.99')
    expect(formatTime(120001)).toBe('2:00.00')
  })
})
