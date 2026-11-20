/** Round once before splitting units so 59.999 seconds carries into the next minute. */
export function formatTime(ms: number): string {
  const centiseconds = Math.round(ms / 10)
  const minutes = Math.floor(centiseconds / 6000)
  const seconds = ((centiseconds % 6000) / 100).toFixed(2).padStart(5, '0')
  return `${minutes}:${seconds}`
}
