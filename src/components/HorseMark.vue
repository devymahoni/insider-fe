<script setup lang="ts">
defineProps<{ color?: string }>()
</script>
<template>
  <svg viewBox="0 0 48 40" fill="currentColor" :style="{ color }" aria-hidden="true">
    <path
      d="M39 3 33 5 29 12 24 15 13 15 8 11 2 12 5 16 10 19 11 25 5 35 9 37 18 26 26 26 29 35 34 37 34 33 31 25 34 19 40 17 45 11 42 6 42 1 39 3Z"
    />
    <path d="m15 25 4 2-1 9h-4zm12 0 4-1 9 9-3 3z" opacity=".65" />
  </svg>
</template>
