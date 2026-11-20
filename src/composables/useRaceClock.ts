import { onMounted, onUnmounted } from 'vue'
import { useRaceStore } from '../stores/race'
/** One view-owned clock; the store has no browser dependency. */
export function useRaceClock() {
  const race = useRaceStore()
  let frame = 0
  let previous: number | undefined
  function animate(now: number) {
    if (previous !== undefined) race.tick(Math.min(now - previous, 100))
    previous = now
    frame = requestAnimationFrame(animate)
  }
  function visibility() {
    previous = undefined
    if (document.hidden) race.pause()
  }
  onMounted(() => {
    frame = requestAnimationFrame(animate)
    document.addEventListener('visibilitychange', visibility)
  })
  onUnmounted(() => {
    cancelAnimationFrame(frame)
    document.removeEventListener('visibilitychange', visibility)
    race.pause()
  })
}
