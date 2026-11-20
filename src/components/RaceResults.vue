<script setup lang="ts">
import { Trophy, ChevronDown } from 'lucide-vue-next'
import { useRaceStore } from '../stores/race'
const race = useRaceStore()
import { formatTime } from '../utils/formatTime'
</script>
<template>
  <section class="panel results" aria-labelledby="results-title">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">THE FINISH LINE</span>
        <h2 id="results-title">Results</h2>
      </div>
      <span class="count">{{ race.results.length }} / 6</span>
    </div>
    <div v-if="!race.results.length" class="empty-state">
      <Trophy :size="28" />
      <h3>Every finish tells a story.</h3>
      <p>Results appear here as each round<br />crosses the finish line.</p>
    </div>
    <div v-else class="result-list">
      <details
        v-for="(result, index) in race.results"
        :key="result.roundId"
        :open="index === race.results.length - 1"
        data-testid="result-round"
      >
        <summary>
          <span class="result-round-label"
            >Round {{ index + 1 }}
            <small>{{ race.schedule[index]?.distance.toLocaleString('en-GB') }} m</small></span
          ><span class="finished-label">FINISHED</span><ChevronDown :size="15" />
        </summary>
        <table>
          <caption class="sr-only">
            Round
            {{
              index + 1
            }}
            final standings
          </caption>
          <thead>
            <tr>
              <th scope="col">POS</th>
              <th scope="col">HORSE</th>
              <th scope="col">TIME</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in result.standings" :key="entry.horseId">
              <td>
                <span :class="{ 'winner-position': entry.position === 1 }">{{
                  entry.position === 1 ? '1st' : entry.position
                }}</span>
              </td>
              <td>
                <span
                  class="result-color"
                  :style="{ background: race.horses.find((h) => h.id === entry.horseId)?.color }"
                />{{ race.horses.find((h) => h.id === entry.horseId)?.name }}
              </td>
              <td>{{ formatTime(entry.timeMs) }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </div>
  </section>
</template>
