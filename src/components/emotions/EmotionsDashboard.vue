<template>
  <DashboardLayout>
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
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '../layout/DashboardLayout.vue'
import EmotionAnalysis from './EmotionAnalysis.vue'
import EmotionStats from './EmotionStats.vue'
</script>

<style scoped>
h1 {
  margin: 0 0 2rem 0;
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
</style>

