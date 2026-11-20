import { describe, expect, it } from 'vitest'
import {
  createHorses,
  createSchedule,
  createSeededRandom,
  progressAt,
  ROUND_DISTANCES,
  simulateRound,
} from './race'

describe('horse roster', () => {
  it('creates 20 identifiable horses with distinct colors and bounded conditions', () => {
    const horses = createHorses(createSeededRandom(42))
    expect(horses).toHaveLength(20)
    expect(new Set(horses.map((horse) => horse.id)).size).toBe(20)
    expect(new Set(horses.map((horse) => horse.color)).size).toBe(20)
    expect(
      horses.every(
        (horse) =>
          Number.isInteger(horse.condition) && horse.condition >= 1 && horse.condition <= 100,
      ),
    ).toBe(true)
    expect(createHorses(() => 0)[0]?.condition).toBe(1)
    expect(createHorses(() => 0.999999)[0]?.condition).toBe(100)
  })
})

describe('race schedule', () => {
  it('selects 10 distinct known horses for each of the six specified distances', () => {
    const horses = createHorses(createSeededRandom(1))
    const original = structuredClone(horses)
    for (let seed = 0; seed < 100; seed++) {
      const schedule = createSchedule(horses, createSeededRandom(seed))
      expect(schedule.map((round) => round.distance)).toEqual(ROUND_DISTANCES)
      expect(schedule.map((round) => round.id)).toEqual([1, 2, 3, 4, 5, 6])
      schedule.forEach((round) => {
        expect(round.horseIds).toHaveLength(10)
        expect(new Set(round.horseIds).size).toBe(10)
        expect(round.horseIds.every((id) => horses.some((horse) => horse.id === id))).toBe(true)
      })
    }
    expect(horses).toEqual(original)
  })

  it('replays the same schedule for the same seed', () => {
    const horses = createHorses()
    expect(createSchedule(horses, createSeededRandom(42))).toEqual(
      createSchedule(horses, createSeededRandom(42)),
    )
    expect(createSchedule(horses, createSeededRandom(42))).not.toEqual(
      createSchedule(horses, createSeededRandom(43)),
    )
  })

  it('rejects rosters which cannot satisfy the rules', () => {
    const horses = createHorses()
    expect(() => createSchedule(horses.slice(0, 10))).toThrow(RangeError)
    expect(() => createSchedule(horses.map((horse) => ({ ...horse, id: 1 })))).toThrow(RangeError)
    expect(() => createSchedule(horses.map((horse) => ({ ...horse, condition: 101 })))).toThrow(
      RangeError,
    )
    expect(() => createSchedule(horses.map((horse) => ({ ...horse, color: '#000000' })))).toThrow(
      RangeError,
    )
  })
})

describe('race simulation', () => {
  const horses = createHorses(createSeededRandom(9))
  const round = createSchedule(horses, createSeededRandom(10))[0]!

  it('ranks every runner exactly once by its finish time without mutating inputs', () => {
    const original = structuredClone({ horses, round })
    const result = simulateRound(round, horses, createSeededRandom(11))
    expect(result.roundId).toBe(round.id)
    expect(result.standings.map((item) => item.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result.standings.map((item) => item.horseId).sort((a, b) => a - b)).toEqual(
      [...round.horseIds].sort((a, b) => a - b),
    )
    expect(result.standings.every((item) => Number.isFinite(item.timeMs) && item.timeMs > 0)).toBe(
      true,
    )
    expect(result.standings.map((item) => item.timeMs)).toEqual(
      result.standings.map((item) => item.timeMs).sort((a, b) => a - b),
    )
    expect({ horses, round }).toEqual(original)
    expect(simulateRound(round, horses, createSeededRandom(11))).toEqual(result)
  })

  it('gives higher condition an advantage under identical form', () => {
    const roster = horses.map((horse, index) => ({ ...horse, condition: index === 0 ? 100 : 1 }))
    const race = { id: 1, distance: 1200, horseIds: roster.slice(0, 10).map((horse) => horse.id) }
    expect(simulateRound(race, roster, () => 0.5).standings[0]?.horseId).toBe(roster[0]?.id)
  })

  it('resolves exact time ties by horse ID rather than entrant draw order', () => {
    const roster = horses.map((horse) => ({ ...horse, condition: 50 }))
    const race = { ...round, horseIds: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] }
    expect(simulateRound(race, roster, () => 0.5).standings.map((item) => item.horseId)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
  })

  it('rejects invalid runners, distances, and random sources', () => {
    expect(() => simulateRound({ ...round, horseIds: Array(10).fill(1) }, horses)).toThrow(
      RangeError,
    )
    expect(() =>
      simulateRound({ ...round, horseIds: [...round.horseIds.slice(0, 9), 99] }, horses),
    ).toThrow(RangeError)
    expect(() => simulateRound({ ...round, distance: 0 }, horses)).toThrow(RangeError)
    expect(() => simulateRound(round, horses, () => 1)).toThrow(RangeError)
  })
})

describe('animation progress', () => {
  it('uses the same clock as finish times and clamps at the track boundaries', () => {
    expect(progressAt(-1, 100)).toBe(0)
    expect(progressAt(0, 100)).toBe(0)
    expect(progressAt(50, 100)).toBe(0.5)
    expect(progressAt(100, 100)).toBe(1)
    expect(progressAt(200, 100)).toBe(1)
    expect(progressAt(Number.NaN, 100)).toBe(0)
    expect(progressAt(20, 0)).toBe(0)
  })
})
