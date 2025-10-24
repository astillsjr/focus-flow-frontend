<template>
  <div id="app">
    <h1>Testing Emotion Statistics</h1>
    
    <div class="test-section">
      <EmotionStats />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmotionStats from '@/components/emotions/EmotionStats.vue'
</script>

<style>
#app {
  padding: 2rem;
}

.test-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>