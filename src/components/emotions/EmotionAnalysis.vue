<template>
  <div class="emotion-analysis">
    <div class="analysis-header">
      <h2>AI Emotional Analysis</h2>
      <BaseButton 
        @click="refreshAnalysis" 
        :loading="isLoading"
        variant="secondary"
        size="sm"
        title="New Analysis"
      >
        New Analysis
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !analysis" class="loading-state">
      <div class="spinner"></div>
      <p>Analyzing your recent emotional patterns...</p>
    </div>

    <!-- Error State -->
    <BaseCard v-else-if="error" padding="lg" class="error-state">
      <p class="error-message">{{ error }}</p>
      <BaseButton @click="refreshAnalysis" variant="danger">
        Try Again
      </BaseButton>
    </BaseCard>

    <!-- No Data State -->
    <BaseCard v-else-if="!hasLogs" padding="lg" class="empty-state">
      <h3>No Emotional Data Yet</h3>
      <p>Start logging your emotions before and after tasks to receive personalized AI insights about your emotional patterns.</p>
      <p>Use the emotion forms on individual tasks in the Tasks dashboard to get started.</p>
    </BaseCard>

    <!-- Analysis Display -->
    <div v-else-if="analysis" class="analysis-content">
      <div class="analysis-card">
        <div class="analysis-icon">🧠</div>
        <div class="analysis-text">
          <p>{{ analysis }}</p>
        </div>
      </div>
      
      <div class="analysis-meta">
        <span class="meta-info">
          📊 Based on {{ emotionStore.emotionLogs.length }} emotion log{{ emotionStore.emotionLogs.length === 1 ? '' : 's' }}
        </span>
        <span class="meta-info" v-if="lastUpdated">
          🕒 Updated {{ formatTime(lastUpdated) }}
        </span>
      </div>
    </div>

    <!-- Empty Analysis State (API returned but no analysis) -->
    <BaseCard v-else padding="lg" class="no-analysis-state">
      <p>No analysis available yet. Click "New Analysis" to generate insights.</p>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEmotionStore } from '@/stores/emotionStore'
import { BaseButton, BaseCard } from '../base'

// Store
const emotionStore = useEmotionStore()

// Local state
const lastUpdated = ref<Date | null>(null)

// Computed properties
const analysis = computed(() => emotionStore.analysis)
const isLoading = computed(() => emotionStore.isLoading)
const error = computed(() => emotionStore.error)
const hasLogs = computed(() => emotionStore.hasLogs)

// Methods
const refreshAnalysis = async () => {
  try {
    await emotionStore.analyzeRecentEmotions()
    lastUpdated.value = new Date()
  } catch (err) {
    // Error is already handled in the store
    // Just log it here for debugging
    console.error('Failed to refresh analysis:', err)
  }
}

const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// Lifecycle
onMounted(async () => {
  // Ensure logs are loaded first
  if (!emotionStore.hasLogs) {
    await emotionStore.fetchEmotionLogs()
  }
  
  // Only fetch analysis if there are logs
  if (emotionStore.hasLogs && !analysis.value) {
    await refreshAnalysis()
  }
})
</script>

<style scoped>
.emotion-analysis {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.analysis-header h2 {
  margin: 0;
  font-size: 1.75rem;
}

/* State Containers */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 8px;
  background-color: #1E1E1E;
  border: 1px solid #4D4D4D;
}

.loading-state p {
  color: #B3B3B3;
  margin: 0;
}

.error-state,
.empty-state,
.no-analysis-state {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #4D4D4D;
  border-top: 4px solid #42A5F5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  background-color: #3d1a1a;
}

.error-message {
  color: #CF6679;
  margin: 0 0 1rem 0;
}

.empty-state h3,
.no-analysis-state h3 {
  margin: 0 0 1rem 0;
  color: #FFFFFF;
}

.empty-state p,
.no-analysis-state p {
  color: #B3B3B3;
  line-height: 1.6;
  max-width: 500px;
  margin: 0.5rem auto;
}

/* Analysis Content */
.analysis-content {
  animation: fadeIn 0.4s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.analysis-card {
  background: linear-gradient(135deg, #BB86FC 0%, #3700B3 100%);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.analysis-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.analysis-text {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  line-height: 1.8;
}

.analysis-text p {
  margin: 0;
  font-size: 1.1rem;
  color: #FFFFFF;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.analysis-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background-color: #1E1E1E;
  border-radius: 8px;
  border: 1px solid #4D4D4D;
}

.meta-info {
  font-size: 0.875rem;
  color: #B3B3B3;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .emotion-analysis {
    padding: 0.5rem;
  }

  .analysis-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .analysis-card {
    padding: 1.5rem;
  }

  .analysis-text {
    padding: 1rem;
  }

  .analysis-text p {
    font-size: 1rem;
  }

  .analysis-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>