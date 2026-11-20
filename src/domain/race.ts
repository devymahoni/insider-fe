export type RandomSource = () => number

export interface Horse {
  id: number
  name: string
  color: string
  condition: number
}

export interface Round {
  id: number
  distance: number
  horseIds: number[]
}

export interface Standing {
  horseId: number
  position: number
  timeMs: number
}

export interface RaceResult {
  roundId: number
  standings: Standing[]
}

export const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const
export const HORSE_COUNT = 20
export const RUNNERS_PER_ROUND = 10

const NAMES = [
  'Northern Star',
  'Copper Wind',
  'Midnight Run',
  'Golden Hour',
  'Silver Arrow',
  'Wild Honey',
  'Blue Horizon',
  'Velvet Thunder',
  'Lucky Clover',
  'Crimson Tide',
  'Desert Rose',
  'Storm Chaser',
  'Emerald Isle',
  'Moon Dancer',
  'Amber Sun',
  'Ocean Drive',
  'Royal Flush',
  'Summer Rain',
  'Iron Heart',
  'Paper Moon',
] as const

const COLORS = [
  '#d95d39',
  '#de9b35',
  '#5961b0',
  '#b88723',
  '#74828f',
  '#be718b',
  '#3b82a0',
  '#8865a8',
  '#669447',
  '#bd4357',
  '#c87858',
  '#527c8b',
  '#388665',
  '#8d75b3',
  '#c6a04d',
  '#3d9aa0',
  '#aa5c8c',
  '#728a42',
  '#687280',
  '#9f784f',
] as const

/** Small reproducible PRNG: injecting a seed makes a reported race replayable. */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function randomUnit(random: RandomSource): number {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Random source must return a finite number in [0, 1).')
  }
  return value
}

export function createHorses(random: RandomSource = Math.random): Horse[] {
  return NAMES.map((name, index) => ({
    id: index + 1,
    name,
    color: COLORS[index]!,
    condition: Math.floor(randomUnit(random) * 100) + 1,
  }))
}

function validateHorses(horses: readonly Horse[]): void {
  if (
    horses.length !== HORSE_COUNT ||
    new Set(horses.map((horse) => horse.id)).size !== HORSE_COUNT
  ) {
    throw new RangeError('A meeting requires exactly 20 horses with unique IDs.')
  }
  if (
    horses.some(
      (horse) => !Number.isInteger(horse.condition) || horse.condition < 1 || horse.condition > 100,
    )
  ) {
    throw new RangeError('Horse condition must be an integer between 1 and 100.')
  }
  if (new Set(horses.map((horse) => horse.color.toLowerCase())).size !== HORSE_COUNT) {
    throw new RangeError('Every horse requires a unique color.')
  }
}

/** Fisher–Yates sampling without replacement, independently for every round. */
export function createSchedule(
  horses: readonly Horse[],
  random: RandomSource = Math.random,
): Round[] {
  validateHorses(horses)
  return ROUND_DISTANCES.map((distance, index) => {
    const ids = horses.map((horse) => horse.id)
    for (let cursor = ids.length - 1; cursor > 0; cursor--) {
      const target = Math.floor(randomUnit(random) * (cursor + 1))
      ;[ids[cursor], ids[target]] = [ids[target]!, ids[cursor]!]
    }
    return { id: index + 1, distance, horseIds: ids.slice(0, RUNNERS_PER_ROUND) }
  })
}

/** Real race time in milliseconds; presentation may accelerate its clock. */
export function simulateRound(
  round: Round,
  horses: readonly Horse[],
  random: RandomSource = Math.random,
): RaceResult {
  validateHorses(horses)
  if (!Number.isFinite(round.distance) || round.distance <= 0) {
    throw new RangeError('Race distance must be positive.')
  }
  if (
    round.horseIds.length !== RUNNERS_PER_ROUND ||
    new Set(round.horseIds).size !== RUNNERS_PER_ROUND
  ) {
    throw new RangeError('Each round requires exactly 10 distinct horses.')
  }
  const horsesById = new Map(horses.map((horse) => [horse.id, horse]))
  const finishes = round.horseIds.map((horseId) => {
    const horse = horsesById.get(horseId)
    if (!horse) throw new RangeError(`Unknown horse ID: ${horseId}`)
    // Condition improves expected speed; form adds bounded uncertainty to each race.
    const speedMetresPerSecond = 14 + horse.condition * 0.055 + randomUnit(random) * 3
    return { horseId, timeMs: Math.round((round.distance / speedMetresPerSecond) * 1000) }
  })
  finishes.sort((left, right) => left.timeMs - right.timeMs || left.horseId - right.horseId)
  return {
    roundId: round.id,
    standings: finishes.map((finish, index) => ({ ...finish, position: index + 1 })),
  }
}

export function progressAt(elapsedMs: number, timeMs: number): number {
  if (!Number.isFinite(elapsedMs) || !Number.isFinite(timeMs) || timeMs <= 0) return 0
  return Math.min(1, Math.max(0, elapsedMs / timeMs))
}
