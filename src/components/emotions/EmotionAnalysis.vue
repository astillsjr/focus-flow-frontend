<template>
  <div class="emotion-analysis">
    <div class="analysis-header">
      <h2>AI Emotional Analysis</h2>
      <button 
        @click="refreshAnalysis" 
        :disabled="isLoading"
        class="btn-refresh"
        title="Refresh Analysis"
      >
        🔄 {{ isLoading ? 'Analyzing...' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !analysis" class="loading">
      <div class="spinner"></div>
      <p>Analyzing your recent emotional patterns...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="refreshAnalysis" class="btn-retry">Try Again</button>
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasLogs" class="no-data">
      <span class="info-icon">💭</span>
      <h3>No Emotional Data Yet</h3>
      <p>Start logging your emotions before and after tasks to receive personalized AI insights about your emotional patterns.</p>
    </div>

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
    <div v-else class="no-analysis">
      <span class="info-icon">📝</span>
      <p>No analysis available yet. Click "Refresh" to generate insights.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEmotionStore } from '@/stores/emotionStore'

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

.btn-refresh {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-refresh:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-refresh:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* State Containers */
.loading,
.error,
.no-data,
.no-analysis {
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background-color: #fff5f5;
  border-color: #ffcdd2;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.error p {
  color: #d32f2f;
  margin: 0.5rem 0;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-retry:hover {
  background-color: #b71c1c;
}

.info-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.no-data h3 {
  margin: 0.5rem 0;
  color: #555;
}

.no-data p {
  color: #777;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 1.5rem;
  line-height: 1.8;
}

.analysis-text p {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.analysis-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.meta-info {
  font-size: 0.875rem;
  color: #666;
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

  .btn-refresh {
    width: 100%;
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