<template>
  <div class="emotions-dashboard">
    <AppNavigation />
    
    <h1>Emotions Dashboard</h1>

    <!-- AI Analysis Section -->
    <section class="section">
      <EmotionAnalysis />
    </section>

    <!-- Statistics Section -->
    <section class="section">
      <EmotionStats />
    </section>

    <!-- Info Section -->
    <section class="section info-section">
      <h3>About Emotion Tracking</h3>
      <p>Log your emotions before and after completing tasks to track patterns and receive AI-powered insights.</p>
      <p>Use the emotion forms on individual tasks in the Tasks dashboard to record how you feel.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import AppNavigation from '../layout/AppNavigation.vue'
import EmotionAnalysis from './EmotionAnalysis.vue'
import EmotionStats from './EmotionStats.vue'
</script>

<style scoped>
.emotions-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  margin: 0 0 2rem 0;
  font-size: 2rem;
}

.section {
  margin-bottom: 2rem;
}

.info-section {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.info-section h3 {
  margin-top: 0;
}

.info-section p {
  margin: 0.5rem 0;
  color: #666;
}

@media (max-width: 768px) {
  .emotions-dashboard {
    padding: 0.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>

