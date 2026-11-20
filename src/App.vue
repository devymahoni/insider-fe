<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, Shuffle, Play, Pause, Flag, Check } from 'lucide-vue-next'
import { useRaceStore } from './stores/race'
import { useRaceClock } from './composables/useRaceClock'
import HorseRoster from './components/HorseRoster.vue'
import RaceTrack from './components/RaceTrack.vue'
import RaceProgram from './components/RaceProgram.vue'
import RaceResults from './components/RaceResults.vue'
const race = useRaceStore()
useRaceClock()
const actionLabel = computed(() =>
  race.status === 'running'
    ? 'Pause races'
    : race.status === 'paused'
      ? 'Resume races'
      : 'Start races',
)
function primaryAction() {
  if (race.status === 'running') race.pause()
  else race.start()
}
</script>
<template>
  <a href="#race-controls" class="skip-link">Skip to race controls</a>
  <div class="app-shell">
    <header class="site-header">
      <a class="brand" href="./" aria-label="Race Day home"
        ><span class="brand-icon"><Flag :size="21" /></span>race<span>day</span><i /></a
      ><span class="header-label">HORSE RACING SIMULATOR</span
      ><span class="header-note"
        >A little luck. A lot of horsepower. <ArrowUpRight :size="15"
      /></span>
    </header>
    <main>
      <div class="page-title">
        <div>
          <div class="eyebrow">YOUR RACE. YOUR FRONT ROW.</div>
          <h1>A day at the races<span>.</span></h1>
          <p>Twenty horses. Six rounds. One unforgettable finish.</p>
        </div>
        <div class="meeting-badge">
          <span class="tiny-dot" />{{
            race.status === 'completed' ? 'MEETING COMPLETE' : 'SIX-ROUND MEETING'
          }}
        </div>
      </div>
      <section id="race-controls" class="controls" aria-label="Race controls">
        <div class="meeting-info">
          <span class="control-flag"><Flag :size="19" /></span>
          <div>
            <b>Race meeting</b
            ><span data-testid="round-counter">{{
              race.status === 'idle'
                ? 'Generate a program to get started'
                : race.status === 'completed'
                  ? 'All 6 rounds complete'
                  : `Round ${race.roundIndex + 1} of 6 · ${race.results.length} completed`
            }}</span>
          </div>
        </div>
        <div class="control-actions">
          <label class="speed-control"
            >Race speed<select v-model.number="race.speed" aria-label="Race speed">
              <option :value="1">1×</option>
              <option :value="2">2×</option>
              <option :value="4">4×</option>
            </select></label
          ><button class="button secondary" :disabled="race.isLocked" @click="race.generate">
            <Shuffle :size="16" />Generate schedule</button
          ><button
            class="button primary"
            :disabled="race.status === 'idle' || race.status === 'completed'"
            @click="primaryAction"
          >
            <Pause v-if="race.status === 'running'" :size="16" /><Check
              v-else-if="race.status === 'completed'"
              :size="16"
            /><Play v-else :size="16" />{{
              race.status === 'completed' ? 'Meeting complete' : actionLabel
            }}
          </button>
        </div>
      </section>
      <div class="dashboard">
        <HorseRoster />
        <div class="race-content">
          <RaceTrack />
          <div class="bottom-grid"><RaceProgram /><RaceResults /></div>
        </div>
      </div>
      <p class="race-announcement sr-only" role="status" aria-live="polite">
        {{
          race.status === 'completed'
            ? 'All six races completed.'
            : race.status === 'paused'
              ? 'Races paused.'
              : `${race.results.length} race results available.`
        }}
      </p>
    </main>
    <footer>
      <span>RACE DAY <span class="separator">/</span> Built for the thrill of the finish.</span
      ><span
        >20 horses <span class="separator">·</span> 6 rounds
        <span class="separator">·</span> Endless possibilities</span
      >
    </footer>
  </div>
</template>
