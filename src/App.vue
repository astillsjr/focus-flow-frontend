<template>
  <div id="app">
    <h1>Testing Emotion Statistics</h1>
    
    <div class="test-section">
      <h2>Emotion Stats</h2>
      <EmotionStats />
    </div>

    <div class="test-section">
      <h2>Emotion Analysis</h2>
      <EmotionAnalysis />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmotionStats from '@/components/emotions/EmotionStats.vue'
import EmotionAnalysis from '@/components/emotions/EmotionAnalysis.vue'
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

.test-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #555;
}
</style>