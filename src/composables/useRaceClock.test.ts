// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRaceClock } from './useRaceClock'
import { useRaceStore } from '../stores/race'

describe('view-owned animation clock', () => {
  let callback: FrameRequestCallback
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((next: FrameRequestCallback) => {
        callback = next
        return 7
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })
  afterEach(() => vi.unstubAllGlobals())

  it('cancels its frame and listener when the track unmounts', () => {
    const remove = vi.spyOn(document, 'removeEventListener')
    const view = mount(
      defineComponent({
        setup() {
          useRaceClock()
          return () => null
        },
      }),
    )
    const race = useRaceStore()
    race.generate()
    race.start()
    view.unmount()
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7)
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(race.status).toBe('paused')
    remove.mockRestore()
  })

  it('clamps delayed frames and pauses when the document becomes hidden', () => {
    const view = mount(
      defineComponent({
        setup() {
          useRaceClock()
          return () => null
        },
      }),
    )
    const race = useRaceStore()
    race.generate()
    race.start()
    callback!(0)
    callback!(10000)
    expect(race.elapsedMs).toBe(1000)
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(race.status).toBe('paused')
    hidden.mockRestore()
    view.unmount()
  })
})
