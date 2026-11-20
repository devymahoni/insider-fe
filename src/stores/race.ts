import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createHorses, createSchedule, simulateRound, progressAt } from '../domain/race'
import type { RaceResult } from '../domain/race'
export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'completed'
export const SIMULATION_RATE = 10
export const useRaceStore = defineStore('race', () => {
  const horses = ref(createHorses())
  const schedule = ref<ReturnType<typeof createSchedule>>([])
  const results = ref<RaceResult[]>([])
  const status = ref<RaceStatus>('idle')
  const roundIndex = ref(0)
  const elapsedMs = ref(0)
  const activeResult = ref<RaceResult | null>(null)
  const speed = ref(1)
  const currentRound = computed(() => schedule.value[roundIndex.value] ?? null)
  const currentHorses = computed(
    () =>
      currentRound.value?.horseIds
        .map((id) => horses.value.find((horse) => horse.id === id)!)
        .filter(Boolean) ?? [],
  )
  const isLocked = computed(() => status.value === 'running' || status.value === 'paused')
  const roundProgress = computed(() =>
    activeResult.value
      ? Math.min(
          1,
          elapsedMs.value / Math.max(...activeResult.value.standings.map((s) => s.timeMs)),
        )
      : 0,
  )
  function generate() {
    if (isLocked.value) return
    schedule.value = createSchedule(horses.value)
    results.value = []
    roundIndex.value = 0
    elapsedMs.value = 0
    activeResult.value = null
    status.value = 'ready'
  }
  function start() {
    if (status.value === 'paused') {
      status.value = 'running'
      return
    }
    if (status.value !== 'ready') return
    activeResult.value = simulateRound(currentRound.value!, horses.value)
    status.value = 'running'
  }
  function pause() {
    if (status.value === 'running') status.value = 'paused'
  }
  function tick(deltaMs: number) {
    if (
      status.value !== 'running' ||
      !activeResult.value ||
      !Number.isFinite(deltaMs) ||
      deltaMs <= 0
    )
      return
    let remaining = deltaMs * SIMULATION_RATE * speed.value
    while (remaining > 0 && status.value === 'running' && activeResult.value) {
      const duration = Math.max(...activeResult.value.standings.map((s) => s.timeMs))
      const consumed = Math.min(remaining, duration - elapsedMs.value)
      elapsedMs.value += consumed
      remaining -= consumed
      if (elapsedMs.value < duration) break
      results.value.push(activeResult.value)
      if (roundIndex.value === schedule.value.length - 1) {
        status.value = 'completed'
        break
      }
      roundIndex.value++
      elapsedMs.value = 0
      activeResult.value = simulateRound(currentRound.value!, horses.value)
    }
  }
  function progress(horseId: number) {
    const standing = activeResult.value?.standings.find((row) => row.horseId === horseId)
    return standing ? progressAt(elapsedMs.value, standing.timeMs) : 0
  }
  return {
    horses,
    schedule,
    results,
    status,
    roundIndex,
    elapsedMs,
    speed,
    currentRound,
    currentHorses,
    isLocked,
    roundProgress,
    generate,
    start,
    pause,
    tick,
    progress,
  }
})
