<script setup lang="ts">
import { computed } from 'vue'
import { Flag, ArrowRight } from 'lucide-vue-next'
import { useRaceStore } from '../stores/race'
import HorseMark from './HorseMark.vue'
const race = useRaceStore()
const displayHorses = computed(() =>
  race.currentHorses.length ? race.currentHorses : race.horses.slice(0, 10),
)
const statusText = computed(
  () =>
    ({
      idle: 'Awaiting schedule',
      ready: 'Ready to race',
      running: 'Race in progress',
      paused: 'Race paused',
      completed: 'Meeting complete',
    })[race.status],
)
</script>
<template>
  <section class="panel track-panel" aria-labelledby="track-title">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">THE RACETRACK</span>
        <h2 id="track-title">
          {{ race.currentRound ? `Round ${race.roundIndex + 1}` : 'A new race awaits' }}
          <span v-if="race.currentRound" class="distance"
            >{{ race.currentRound.distance.toLocaleString('en-GB') }} m</span
          >
        </h2>
      </div>
      <span class="status-pill" :class="race.status" data-testid="race-status"
        ><span />{{ statusText }}</span
      >
    </div>
    <div class="track-top">
      <span>START</span
      ><span
        >{{ race.currentRound?.distance.toLocaleString('en-GB') ?? '1,200' }} METRES
        <ArrowRight :size="13" /></span
      ><Flag :size="15" />
    </div>
    <div
      class="lanes"
      :class="{ 'is-racing': race.status === 'running', 'is-empty': race.status === 'idle' }"
      aria-label="Animated race track"
    >
      <div class="finish-line" />
      <div
        v-for="(horse, index) in displayHorses"
        :key="horse.id"
        class="lane"
        data-testid="race-lane"
      >
        <span class="lane-number">{{ index + 1 }}</span>
        <div class="lane-course">
          <div class="runner" :style="{ left: `${race.progress(horse.id) * 100}%` }">
            <span class="runner-name">{{ horse.name }}</span><HorseMark :color="horse.color" /><span
              class="saddle"
              >{{ horse.id }}</span
            >
          </div>
        </div>
      </div>
      <div v-if="race.status === 'idle'" class="track-empty">
        <div class="empty-icon"><Flag :size="24" /></div>
        <h3>Your next race starts here.</h3>
        <p>Generate a schedule to meet the runners.</p>
      </div>
    </div>
    <div class="track-bottom">
      <span
        ><span class="tiny-dot" />{{
          race.status === 'idle'
            ? 'Track ready'
            : `${Math.round(race.roundProgress * 100)}% of round completed`
        }}</span
      ><span>10 lanes <span class="separator">/</span> Turf track</span>
    </div>
  </section>
</template>
