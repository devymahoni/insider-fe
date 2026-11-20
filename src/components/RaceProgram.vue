<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Check, CalendarDays } from 'lucide-vue-next'
import { useRaceStore } from '../stores/race'
const race = useRaceStore()
const expanded = ref<number | null>(null)
</script>
<template>
  <section class="panel program" aria-labelledby="program-title">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">THE MEETING</span>
        <h2 id="program-title">Race program</h2>
      </div>
      <span class="small muted">6 rounds</span>
    </div>
    <div v-if="!race.schedule.length" class="empty-state">
      <CalendarDays :size="27" />
      <h3>No races scheduled</h3>
      <p>Generate a program of six rounds.<br />Ten randomly selected horses in each.</p>
    </div>
    <div v-else class="program-list">
      <div
        v-for="(round, index) in race.schedule"
        :key="round.id"
        class="program-item"
        :class="{ active: index === race.roundIndex, done: index < race.results.length }"
        data-testid="schedule-round"
      >
        <button
          class="program-row"
          :aria-expanded="expanded === round.id"
          @click="expanded = expanded === round.id ? null : round.id"
        >
          <span class="round-icon"
            ><Check v-if="index < race.results.length" :size="15" /><template v-else>{{
              String(index + 1).padStart(2, '0')
            }}</template></span
          ><span
            ><b>Round {{ index + 1 }}</b
            ><small>10 horses</small></span
          ><strong>{{ round.distance.toLocaleString('en-GB') }} <small>m</small></strong
          ><ChevronDown :size="15" :class="{ flipped: expanded === round.id }" />
        </button>
        <ul v-if="expanded === round.id" class="entrant-list">
          <li v-for="id in round.horseIds" :key="id">
            <span :style="{ background: race.horses.find((h) => h.id === id)?.color }" />{{
              race.horses.find((h) => h.id === id)?.name
            }}
          </li>
        </ul>
      </div>
    </div>
    <div class="panel-foot">
      {{
        race.schedule.length
          ? 'Select a round to view its runners'
          : 'Distances from 1,200 to 2,200 metres'
      }}
    </div>
  </section>
</template>
