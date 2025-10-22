<template>
  <div class="emotion-tracker">
    <div class="emotion-tracker-header">
      <h3>Emotion Tracker</h3>
      <div class="tracker-status">
        <span v-if="currentPhase" class="phase-indicator" :class="phaseClass">
          {{ phaseText }}
        </span>
      </div>
    </div>

    <div v-if="!selectedTask" class="no-task-selected">
      <div class="no-task-icon">😊</div>
      <p>Select a task to track your emotions</p>
    </div>

    <div v-else class="emotion-tracking-interface">
      <div class="task-context">
        <h4>{{ selectedTask.title }}</h4>
        <p class="task-description">{{ selectedTask.description || 'No description' }}</p>
      </div>

      <div class="emotion-selection">
        <h4>How are you feeling {{ phaseText.toLowerCase() }}?</h4>
        <div class="emotion-grid">
          <button
            v-for="emotion in availableEmotions"
            :key="emotion"
            @click="selectEmotion(emotion)"
            :class="['emotion-btn', { active: selectedEmotion === emotion }]"
            :disabled="isLoading"
          >
            <span class="emotion-emoji">{{ getEmotionEmoji(emotion) }}</span>
            <span class="emotion-name">{{ emotion }}</span>
          </button>
        </div>

        <div v-if="selectedEmotion" class="emotion-details">
          <div class="selected-emotion">
            <span class="emotion-emoji">{{ getEmotionEmoji(selectedEmotion) }}</span>
            <span class="emotion-name">{{ selectedEmotion }}</span>
          </div>
          <button
            @click="logEmotion"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-small"></span>
            {{ isLoading ? 'Logging...' : `Log ${phaseText} Emotion` }}
          </button>
        </div>
      </div>

      <div v-if="recentEmotions.length > 0" class="recent-emotions">
        <h4>Recent Emotions for This Task</h4>
        <div class="emotion-history">
          <div
            v-for="emotion in recentEmotions"
            :key="emotion._id"
            class="emotion-entry"
          >
            <div class="emotion-info">
              <span class="emotion-emoji">{{ getEmotionEmoji(emotion.emotion) }}</span>
              <span class="emotion-name">{{ emotion.emotion }}</span>
              <span class="emotion-phase">{{ emotion.phase }}</span>
            </div>
            <div class="emotion-time">
              {{ formatDate(emotion.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEmotionsStore } from '@/stores/emotions'
import type { TaskDoc, LogDoc } from '@/types/api'

const props = defineProps<{
  selectedTask: TaskDoc | null
  currentPhase: 'before' | 'after' | null
}>()

const emit = defineEmits<{
  'emotion-logged': [emotion: LogDoc]
  'phase-completed': [phase: 'before' | 'after']
}>()

const emotionsStore = useEmotionsStore()

// Local state
const selectedEmotion = ref<string | null>(null)

// Computed properties
const isLoading = computed(() => emotionsStore.isLoading)
const error = computed(() => emotionsStore.error)

const phaseText = computed(() => {
  return props.currentPhase === 'before' ? 'Before' : 'After'
})

const phaseClass = computed(() => {
  return props.currentPhase === 'before' ? 'phase-before' : 'phase-after'
})

const availableEmotions = [
  'Happy', 'Excited', 'Confident', 'Motivated', 'Focused',
  'Calm', 'Neutral', 'Tired', 'Stressed', 'Anxious',
  'Frustrated', 'Overwhelmed', 'Sad', 'Angry', 'Confused'
]

const recentEmotions = computed(() => {
  if (!props.selectedTask) return []
  return emotionsStore.getEmotionsByTask(props.selectedTask._id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// Methods
const getEmotionEmoji = (emotion: string) => {
  const emojiMap: Record<string, string> = {
    'Happy': '😊', 'Excited': '🤩', 'Confident': '💪', 'Motivated': '🚀', 'Focused': '🎯',
    'Calm': '😌', 'Neutral': '😐', 'Tired': '😴', 'Stressed': '😰', 'Anxious': '😟',
    'Frustrated': '😤', 'Overwhelmed': '😵', 'Sad': '😢', 'Angry': '😠', 'Confused': '😕'
  }
  return emojiMap[emotion] || '😐'
}

const selectEmotion = (emotion: string) => {
  selectedEmotion.value = emotion
}

const logEmotion = async () => {
  if (!selectedEmotion.value || !props.selectedTask || !props.currentPhase) return

  let success = false
  if (props.currentPhase === 'before') {
    success = await emotionsStore.logBeforeEmotion(props.selectedTask._id, selectedEmotion.value)
  } else {
    success = await emotionsStore.logAfterEmotion(props.selectedTask._id, selectedEmotion.value)
  }

  if (success) {
    selectedEmotion.value = null
    emit('phase-completed', props.currentPhase)
    
    // Find the newly created emotion log
    const newEmotion = emotionsStore.emotionLogs.find(log => 
      log.task === props.selectedTask!._id && 
      log.emotion === selectedEmotion.value &&
      log.phase === props.currentPhase
    )
    
    if (newEmotion) {
      emit('emotion-logged', newEmotion)
    }
  }
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

// Watch for task changes
watch(() => props.selectedTask, () => {
  selectedEmotion.value = null
})

// Watch for phase changes
watch(() => props.currentPhase, () => {
  selectedEmotion.value = null
})
</script>

<style scoped>
.emotion-tracker {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

.emotion-tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.emotion-tracker-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.phase-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.phase-before {
  background-color: #fff3cd;
  color: #856404;
}

.phase-after {
  background-color: #d1ecf1;
  color: #0c5460;
}

.no-task-selected {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-task-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.emotion-tracking-interface {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-context {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.task-context h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.task-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.emotion-selection h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.emotion-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.emotion-btn:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.emotion-btn.active {
  border-color: #007bff;
  background-color: #e3f2fd;
  color: #1565c0;
}

.emotion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.emotion-emoji {
  font-size: 1.5rem;
}

.emotion-name {
  font-weight: 500;
  text-align: center;
}

.emotion-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #007bff;
}

.selected-emotion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.recent-emotions h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.emotion-history {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.emotion-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.emotion-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.emotion-time {
  font-size: 0.8rem;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .emotion-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
  }
  
  .emotion-btn {
    padding: 0.75rem 0.25rem;
  }
  
  .emotion-details {
    flex-direction: column;
    align-items: stretch;
  }
  
  .emotion-entry {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
