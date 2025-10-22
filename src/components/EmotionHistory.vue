<template>
  <div class="emotion-history">
    <div class="history-header">
      <h3>Emotion Trends</h3>
      <div class="history-controls">
        <button @click="refreshTrends" class="btn btn-secondary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-small"></span>
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
        <button @click="analyzeEmotions" class="btn btn-primary" :disabled="isLoading">
          Analyze
        </button>
      </div>
    </div>

    <div v-if="isLoading && !emotionTrends" class="loading-state">
      <div class="spinner"></div>
      <p>Loading emotion trends...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="refreshTrends" class="btn btn-secondary">Retry</button>
    </div>

    <div v-else-if="!emotionTrends" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>No emotion data yet</h3>
      <p>Start tracking your emotions to see trends and insights.</p>
    </div>

    <div v-else class="trends-content">
      <!-- Overview Stats -->
      <div class="overview-stats">
        <div class="stat-card">
          <div class="stat-number">{{ emotionTrends.total }}</div>
          <div class="stat-label">Total Emotions Logged</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ Object.keys(emotionTrends.counts).length }}</div>
          <div class="stat-label">Unique Emotions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ emotionTrends.byPhase.before ? Object.keys(emotionTrends.byPhase.before).length : 0 }}</div>
          <div class="stat-label">Before Emotions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ emotionTrends.byPhase.after ? Object.keys(emotionTrends.byPhase.after).length : 0 }}</div>
          <div class="stat-label">After Emotions</div>
        </div>
      </div>

      <!-- Emotion Counts -->
      <div class="emotion-breakdown">
        <h4>Emotion Breakdown</h4>
        <div class="emotion-counts">
          <div
            v-for="(count, emotion) in emotionTrends.counts"
            :key="emotion"
            class="emotion-count-item"
          >
            <div class="emotion-info">
              <span class="emotion-emoji">{{ getEmotionEmoji(emotion) }}</span>
              <span class="emotion-name">{{ emotion }}</span>
            </div>
            <div class="emotion-count">
              <span class="count-number">{{ count }}</span>
              <div class="count-bar">
                <div 
                  class="count-fill" 
                  :style="{ width: `${(count / emotionTrends.total) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Phase Breakdown -->
      <div class="phase-breakdown">
        <h4>Before vs After</h4>
        <div class="phase-comparison">
          <div class="phase-section">
            <h5>Before Task</h5>
            <div v-if="emotionTrends.byPhase.before" class="phase-emotions">
              <div
                v-for="(count, emotion) in emotionTrends.byPhase.before"
                :key="emotion"
                class="phase-emotion-item"
              >
                <span class="emotion-emoji">{{ getEmotionEmoji(emotion) }}</span>
                <span class="emotion-name">{{ emotion }}</span>
                <span class="emotion-count">{{ count }}</span>
              </div>
            </div>
            <div v-else class="no-data">No before emotions logged</div>
          </div>
          
          <div class="phase-section">
            <h5>After Task</h5>
            <div v-if="emotionTrends.byPhase.after" class="phase-emotions">
              <div
                v-for="(count, emotion) in emotionTrends.byPhase.after"
                :key="emotion"
                class="phase-emotion-item"
              >
                <span class="emotion-emoji">{{ getEmotionEmoji(emotion) }}</span>
                <span class="emotion-name">{{ emotion }}</span>
                <span class="emotion-count">{{ count }}</span>
              </div>
            </div>
            <div v-else class="no-data">No after emotions logged</div>
          </div>
        </div>
      </div>

      <!-- Recent Emotions Timeline -->
      <div class="recent-timeline">
        <h4>Recent Emotions</h4>
        <div class="timeline">
          <div
            v-for="emotion in emotionTrends.recentEmotions"
            :key="emotion.createdAt"
            class="timeline-item"
          >
            <div class="timeline-marker" :class="`phase-${emotion.phase}`"></div>
            <div class="timeline-content">
              <div class="timeline-emotion">
                <span class="emotion-emoji">{{ getEmotionEmoji(emotion.emotion) }}</span>
                <span class="emotion-name">{{ emotion.emotion }}</span>
                <span class="emotion-phase">{{ emotion.phase }}</span>
              </div>
              <div class="timeline-time">{{ formatDate(emotion.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Analysis -->
      <div v-if="emotionAnalysis" class="ai-analysis">
        <h4>AI Insights</h4>
        <div class="analysis-content">
          <div class="analysis-icon">🤖</div>
          <div class="analysis-text">{{ emotionAnalysis }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEmotionsStore } from '@/stores/emotions'

const emotionsStore = useEmotionsStore()

// Computed properties
const emotionTrends = computed(() => emotionsStore.emotionTrends)
const emotionAnalysis = computed(() => emotionsStore.emotionAnalysis)
const isLoading = computed(() => emotionsStore.isLoading)
const error = computed(() => emotionsStore.error)

// Methods
const getEmotionEmoji = (emotion: string) => {
  const emojiMap: Record<string, string> = {
    'Happy': '😊', 'Excited': '🤩', 'Confident': '💪', 'Motivated': '🚀', 'Focused': '🎯',
    'Calm': '😌', 'Neutral': '😐', 'Tired': '😴', 'Stressed': '😰', 'Anxious': '😟',
    'Frustrated': '😤', 'Overwhelmed': '😵', 'Sad': '😢', 'Angry': '😠', 'Confused': '😕'
  }
  return emojiMap[emotion] || '😐'
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

const refreshTrends = async () => {
  await emotionsStore.fetchEmotionTrends()
}

const analyzeEmotions = async () => {
  await emotionsStore.analyzeRecentEmotions()
}

// Lifecycle
onMounted(async () => {
  await refreshTrends()
})
</script>

<style scoped>
.emotion-history {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 1000px;
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 1rem;
}

.history-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.history-controls {
  display: flex;
  gap: 0.75rem;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.trends-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.emotion-breakdown h4, .phase-breakdown h4, .recent-timeline h4, .ai-analysis h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.emotion-counts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.emotion-count-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.emotion-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 150px;
}

.emotion-emoji {
  font-size: 1.25rem;
}

.emotion-name {
  font-weight: 500;
  color: #2c3e50;
}

.emotion-count {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.count-number {
  font-weight: bold;
  color: #007bff;
  min-width: 2rem;
}

.count-bar {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.count-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.phase-breakdown {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.phase-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.phase-section h5 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.phase-emotions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.phase-emotion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.phase-emotion-item .emotion-count {
  margin-left: auto;
  font-weight: bold;
  color: #007bff;
}

.no-data {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid white;
}

.timeline-marker.phase-before {
  background-color: #ffc107;
}

.timeline-marker.phase-after {
  background-color: #28a745;
}

.timeline-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.timeline-emotion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.emotion-phase {
  padding: 0.25rem 0.5rem;
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.timeline-time {
  font-size: 0.85rem;
  color: #666;
}

.ai-analysis {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
}

.analysis-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.analysis-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.analysis-text {
  line-height: 1.6;
  font-size: 1rem;
}

.spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .history-controls {
    justify-content: center;
  }
  
  .overview-stats {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .phase-comparison {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .timeline {
    padding-left: 1.5rem;
  }
  
  .timeline-marker {
    left: -1.5rem;
  }
}
</style>
