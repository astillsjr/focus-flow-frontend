<template>
  <div class="emotion-stats">
    <h2>Emotion Statistics</h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      Loading statistics...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- No Data State -->
    <div v-else-if="!stats || stats.totalLogs === 0" class="no-data">
      <p>No emotion logs yet. Start tracking your emotions by logging how you feel before and after tasks!</p>
    </div>

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
        <button 
          @click="refreshStats" 
          :disabled="isLoading"
          class="btn-primary"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEmotionStore, EMOTION_LABELS } from '@/stores/emotionStore'

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
  margin-bottom: 1.5rem;
}

h3 {
  margin: 1.5rem 0 1rem;
}

/* Loading, Error, No Data States */
.loading,
.error,
.no-data {
  padding: 2rem;
  text-align: center;
  border-radius: 4px;
  margin: 1rem 0;
}

.loading {
  background-color: #f5f5f5;
}

.error {
  background-color: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.no-data {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-value.emotion-badge {
  font-size: 1.25rem;
  background-color: #e3f2fd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: inline-block;
}

/* Trend Classes */
.trend-improving {
  color: #28a745;
}

.trend-declining {
  color: #dc3545;
}

.trend-stable {
  color: #007bff;
}

.trend-insufficient_data {
  color: #6c757d;
  font-size: 1rem;
}

/* Emotion Distribution */
.emotion-distribution {
  background: #fff;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-bottom: 2rem;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.emotion-bar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.emotion-label {
  min-width: 120px;
  font-size: 0.875rem;
}

.bar-container {
  flex: 1;
  height: 28px;
  background-color: #f0f0f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-fill.positive {
  background-color: #28a745;
}

.bar-fill.negative {
  background-color: #dc3545;
}

.bar-fill.neutral {
  background-color: #6c757d;
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
  background: #fff;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-bottom: 2rem;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.comparison-section h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.emotion-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emotion-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.emotion-count {
  font-weight: bold;
}

.no-data-small {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}
</style>

