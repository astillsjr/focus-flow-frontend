<template>
  <DashboardLayout>
    <div :style="cssVars">
      <h1>Emotion Insights</h1>

    <!-- AI Analysis Section -->
    <section class="section">
      <EmotionAnalysis />
    </section>

    <!-- Statistics Section -->
    <section class="section">
      <EmotionStats />
    </section>

    <!-- Info Section -->
    <section class="section">
      <BaseCard padding="lg">
        <h3>About Emotion Tracking</h3>
        <p>Log your emotions before and after completing tasks to track patterns and receive AI-powered insights.</p>
        <p>Use the emotion forms on individual tasks in the Tasks dashboard to record how you feel.</p>
      </BaseCard>
    </section>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '../layout/DashboardLayout.vue'
import EmotionAnalysis from './EmotionAnalysis.vue'
import EmotionStats from './EmotionStats.vue'
import { BaseCard } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()
</script>

<style scoped>
h1 {
  margin: 0 0 var(--spacing-xl) 0;
  color: var(--color-text);
}

.section {
  margin-bottom: var(--spacing-xl);
}

h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
}

p {
  margin: var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}
</style>

