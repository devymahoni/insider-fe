<script setup lang="ts">
import { useRaceStore } from '../stores/race'
import HorseMark from './HorseMark.vue'
const race = useRaceStore()
</script>
<template>
  <aside class="panel roster" aria-labelledby="roster-title">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">THE PADDOCK</span>
        <h2 id="roster-title">Horse list <span class="count">20</span></h2>
      </div>
      <span class="small muted">Condition / 100</span>
    </div>
    <div class="roster-columns"><span>HORSE</span><span>CONDITION</span></div>
    <ul class="roster-list">
      <li v-for="horse in race.horses" :key="horse.id" data-testid="horse-row">
        <span class="horse-number">{{ String(horse.id).padStart(2, '0') }}</span><HorseMark
          :color="horse.color"
        /><span class="horse-name">{{ horse.name }}</span
        ><span class="condition"
          ><span class="condition-bar"><i :style="{ width: horse.condition + '%' }" /></span
          ><b>{{ horse.condition }}</b></span
        >
      </li>
    </ul>
    <div class="panel-foot"><span class="tiny-dot" />20 horses · 10 runners per round</div>
  </aside>
</template>
