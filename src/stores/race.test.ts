import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRaceStore } from './race'

describe('race meeting lifecycle', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('requires a schedule and ignores duplicate starts', () => {
    const race = useRaceStore()
    race.start()
    expect(race.status).toBe('idle')
    race.generate()
    race.start()
    race.tick(100)
    const progress = race.currentHorses.map((horse) => race.progress(horse.id))
    race.start()
    expect(race.currentHorses.map((horse) => race.progress(horse.id))).toEqual(progress)
    expect(race.status).toBe('running')
    expect(race.results).toHaveLength(0)
  })

  it('publishes only finished rounds and preserves remaining time between rounds', () => {
    const race = useRaceStore()
    race.generate()
    race.start()
    race.tick(100)
    expect(race.results).toHaveLength(0)
    race.tick(10000)
    expect(race.results).toHaveLength(1)
    expect(race.roundIndex).toBe(1)
    expect(race.elapsedMs).toBeGreaterThan(0)
    expect(race.results[0]?.standings.map((row) => row.horseId).sort()).toEqual(
      [...race.schedule[0]!.horseIds].sort(),
    )
  })

  it('freezes paused races, protects the schedule and resumes from the same point', () => {
    const race = useRaceStore()
    race.generate()
    const schedule = structuredClone(
      race.schedule.map((round) => ({ ...round, horseIds: [...round.horseIds] })),
    )
    race.start()
    race.tick(300)
    race.generate()
    expect(race.schedule).toEqual(schedule)
    race.pause()
    const elapsed = race.elapsedMs
    race.tick(999999)
    race.generate()
    expect(race.elapsedMs).toBe(elapsed)
    expect(race.status).toBe('paused')
    expect(race.schedule).toEqual(schedule)
    race.start()
    race.tick(100)
    expect(race.elapsedMs).toBeGreaterThan(elapsed)
  })

  it('completes each round once even with a large tick and can generate a new meeting', () => {
    const race = useRaceStore()
    race.generate()
    race.start()
    race.tick(1000000)
    expect(race.status).toBe('completed')
    expect(race.results.map((result) => result.roundId)).toEqual([1, 2, 3, 4, 5, 6])
    race.tick(1000000)
    race.start()
    expect(race.results).toHaveLength(6)
    race.generate()
    expect(race.status).toBe('ready')
    expect(race.results).toHaveLength(0)
    expect(race.roundIndex).toBe(0)
    expect(race.elapsedMs).toBe(0)
    expect(race.currentHorses.every((horse) => race.progress(horse.id) === 0)).toBe(true)
  })

  it('ignores invalid deltas and applies the chosen speed', () => {
    const race = useRaceStore()
    race.generate()
    race.start()
    for (const delta of [NaN, Infinity, -1, 0]) race.tick(delta)
    expect(race.elapsedMs).toBe(0)
    race.speed = 4
    race.tick(100)
    expect(race.elapsedMs).toBe(4000)
  })
})
