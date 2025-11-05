<template>
  <div class="emotion-stats" :style="cssVars">
    <h2>Emotion Statistics</h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>Loading statistics...</p>
    </div>

    <!-- Error State -->
    <BaseCard v-else-if="error" padding="lg" class="error-state">
      <p class="error-message">{{ error }}</p>
      <BaseButton @click="refreshStats" variant="danger">
        Try Again
      </BaseButton>
    </BaseCard>

    <!-- No Data State -->
    <BaseCard v-else-if="!stats || stats.totalLogs === 0" padding="lg" class="empty-state">
      <h3>No Emotion Logs Yet</h3>
      <p>Start tracking your emotions by logging how you feel before and after tasks!</p>
      <p>Use the emotion forms on individual tasks in the Tasks dashboard to get started.</p>
    </BaseCard>

    <!-- Stats Display -->
    <div v-else class="stats-content">
      <!-- Overview Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Logs</div>
          <div class="stat-value">{{ stats.totalLogs }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Average Per Day</div>
          <div class="stat-value">{{ stats.averageEmotionsPerDay.toFixed(1) }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Most Common</div>
          <div class="stat-value emotion-badge">
            {{ stats.mostCommonEmotion ? EMOTION_LABELS[stats.mostCommonEmotion] : 'N/A' }}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Recent Trend</div>
          <div class="stat-value" :class="getTrendClass(stats.recentTrend)">
            {{ getTrendLabel(stats.recentTrend) }}
          </div>
        </div>
      </div>

      <!-- Emotion Distribution -->
      <div class="emotion-distribution">
        <h3>Emotion Distribution</h3>
        <div class="distribution-bars">
          <div 
            v-for="[emotion, count] in emotionCounts" 
            :key="emotion"
            class="emotion-bar-item"
          >
            <div class="emotion-label">
              {{ EMOTION_LABELS[emotion] }}
            </div>
            <div class="bar-container">
              <div 
                class="bar-fill" 
                :style="{ width: `${(count / stats.totalLogs) * 100}%` }"
                :class="getEmotionCategory(emotion)"
              ></div>
              <span class="bar-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Before vs After Comparison -->
      <div class="before-after-comparison">
        <h3>Before vs After Task Emotions</h3>
        <div class="comparison-grid">
          <div class="comparison-section">
            <h4>Before Starting Tasks</h4>
            <div class="emotion-list">
              <div 
                v-for="[emotion, count] in beforeEmotionCounts.slice(0, 5)" 
                :key="'before-' + emotion"
                class="emotion-item"
              >
                <span class="emotion-name">{{ EMOTION_LABELS[emotion] }}</span>
                <span class="emotion-count">{{ count }}</span>
              </div>
              <div v-if="beforeEmotionCounts.length === 0" class="no-data-small">
                No "before" emotions logged yet
              </div>
            </div>
          </div>

          <div class="comparison-section">
            <h4>After Completing Tasks</h4>
            <div class="emotion-list">
              <div 
                v-for="[emotion, count] in afterEmotionCounts.slice(0, 5)" 
                :key="'after-' + emotion"
                class="emotion-item"
              >
                <span class="emotion-name">{{ EMOTION_LABELS[emotion] }}</span>
                <span class="emotion-count">{{ count }}</span>
              </div>
              <div v-if="afterEmotionCounts.length === 0" class="no-data-small">
                No "after" emotions logged yet
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="action-buttons">
        <BaseButton 
          @click="refreshStats" 
          :loading="isLoading"
          variant="secondary"
        >
          Refresh Stats
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEmotionStore } from '@/stores/emotionStore'
import { EMOTION_LABELS } from '@/constants'
import { BaseButton, BaseCard } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

// Store
const emotionStore = useEmotionStore()

// Computed properties
const stats = computed(() => emotionStore.stats)
const isLoading = computed(() => emotionStore.isLoading)
const error = computed(() => emotionStore.error)

// Calculate emotion counts from all logs
const emotionCounts = computed(() => {
  const counts = new Map<string, number>()
  
  emotionStore.emotionLogs.forEach(log => {
    const current = counts.get(log.emotion) || 0
    counts.set(log.emotion, current + 1)
  })
  
  // Sort by count descending
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
})

// Calculate before emotion counts
const beforeEmotionCounts = computed(() => {
  const counts = new Map<string, number>()
  
  emotionStore.beforeLogs.forEach(log => {
    const current = counts.get(log.emotion) || 0
    counts.set(log.emotion, current + 1)
  })
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
})

// Calculate after emotion counts
const afterEmotionCounts = computed(() => {
  const counts = new Map<string, number>()
  
  emotionStore.afterLogs.forEach(log => {
    const current = counts.get(log.emotion) || 0
    counts.set(log.emotion, current + 1)
  })
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
})

// Methods
const refreshStats = async () => {
  await emotionStore.fetchEmotionStats()
}

const getTrendLabel = (trend: string): string => {
  const labels: Record<string, string> = {
    improving: '↑ Improving',
    declining: '↓ Declining',
    stable: '→ Stable',
    insufficient_data: '— Not Enough Data'
  }
  return labels[trend] || trend
}

const getTrendClass = (trend: string): string => {
  return `trend-${trend}`
}

const getEmotionCategory = (emotion: string): string => {
  const positive = ['excited', 'confident', 'motivated', 'calm', 'satisfied', 'relieved', 'accomplished']
  const negative = ['nervous', 'anxious', 'overwhelmed', 'frustrated', 'dread', 'disappointed']
  
  if (positive.includes(emotion)) return 'positive'
  if (negative.includes(emotion)) return 'negative'
  return 'neutral'
}

// Lifecycle
onMounted(async () => {
  // Always fetch both stats and logs to ensure all sections have data
  // For production optimization: consider checking if data exists first to avoid unnecessary API calls
  // (e.g., if (!emotionStore.hasLogs) ... if (!stats.value) ...)
  await Promise.all([
    emotionStore.fetchEmotionLogs(),
    emotionStore.fetchEmotionStats()
  ])
})
</script>

<style scoped>
.emotion-stats {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

h2 {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

h3 {
  margin: var(--spacing-lg) 0 var(--spacing-md);
  color: var(--color-text);
}

/* Loading, Error, No Data States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  margin: var(--spacing-md) 0;
}

.loading-state {
  padding: var(--spacing-xl);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
}

.loading-state p {
  color: var(--color-text-muted);
  margin: 0;
}

.error-state {
  background-color: rgba(207, 102, 121, 0.1);
}

.error-message {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
}

.empty-state p {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: var(--spacing-sm) 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--color-surface-variant);
  padding: var(--spacing-lg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  text-align: center;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
}

.stat-value {
  font-size: var(--font-size-xxxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.stat-value.emotion-badge {
  font-size: var(--font-size-xl);
  background-color: rgba(66, 165, 245, 0.1);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  display: inline-block;
}

/* Trend Classes */
.trend-improving {
  color: var(--color-completed);
}

.trend-declining {
  color: var(--color-error);
}

.trend-stable {
  color: var(--color-in-progress);
}

.trend-insufficient_data {
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}

/* Emotion Distribution */
.emotion-distribution {
  background: var(--color-surface-variant);
  padding: var(--spacing-lg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.emotion-bar-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.emotion-label {
  min-width: 120px;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.bar-container {
  flex: 1;
  height: 28px;
  background-color: var(--color-background-muted);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width var(--transition-slow);
}

.bar-fill.positive {
  background-color: var(--color-completed);
}

.bar-fill.negative {
  background-color: var(--color-error);
}

.bar-fill.neutral {
  background-color: var(--color-text-muted);
}

.bar-count {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  font-weight: 600;
}

/* Before/After Comparison */
.before-after-comparison {
  background: var(--color-surface-variant);
  padding: var(--spacing-lg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.comparison-section h4 {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.emotion-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.emotion-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background-color: var(--color-surface-container-high);
  border-radius: var(--radius-sm);
  color: var(--color-text);
}

.emotion-count {
  font-weight: var(--font-weight-bold);
}

.no-data-small {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  padding: var(--spacing-md);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>

