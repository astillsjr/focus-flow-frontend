<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ headerTitle }}</h3>
          <p class="modal-subtitle">{{ subtitleText }}</p>
        </div>
        
        <div class="emotion-grid">
          <button
            v-for="emotion in VALID_EMOTIONS"
            :key="emotion"
            @click="selectEmotion(emotion)"
            class="emotion-button"
            :class="{ 'selected': selectedEmotion === emotion }"
            type="button"
          >
            <span class="emotion-icon">{{ getEmotionIcon(emotion) }}</span>
            <span class="emotion-label">{{ EMOTION_LABELS[emotion] }}</span>
          </button>
        </div>

        <div v-if="displayError" class="error-message">
          {{ displayError }}
        </div>

        <div class="modal-actions">
          <button 
            @click="handleCancel" 
            class="button-secondary"
            :disabled="externalLoading"
            type="button"
          >
            Cancel
          </button>
          <button 
            @click="handleSubmit" 
            class="button-primary"
            :disabled="!selectedEmotion || externalLoading"
            type="button"
          >
            {{ submitButtonText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VALID_EMOTIONS, EMOTION_LABELS, type Emotion } from '@/stores/emotionStore'

const props = withDefaults(defineProps<{
  isOpen: boolean
  taskId: string
  taskTitle: string
  phase: 'before' | 'after'
  externalLoading?: boolean
  externalError?: string | null
}>(), {
  externalLoading: false,
  externalError: null
})

const emit = defineEmits<{
  submit: [emotion: Emotion]
  cancel: []
}>()

const selectedEmotion = ref<Emotion | null>(null)

// Reset selection when modal closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    selectedEmotion.value = null
  }
})

// Computed properties for dynamic text
const headerTitle = computed(() => {
  return props.phase === 'before' 
    ? `Before You Start: "${props.taskTitle}"`
    : `Task Completed: "${props.taskTitle}"`
})

const subtitleText = computed(() => {
  return props.phase === 'before'
    ? 'How do you feel about starting this task?'
    : 'How do you feel after completing this task?'
})

const submitButtonText = computed(() => {
  if (props.externalLoading) return 'Logging...'
  return props.phase === 'before' ? 'Start Task' : 'Complete Task'
})

// Use external error if provided
const displayError = computed(() => props.externalError)

const selectEmotion = (emotion: Emotion) => {
  selectedEmotion.value = emotion
}

const handleSubmit = () => {
  if (selectedEmotion.value && !props.externalLoading) {
    emit('submit', selectedEmotion.value)
    // Note: The watcher will reset when modal closes
  }
}

const handleCancel = () => {
  if (!props.externalLoading) {
    emit('cancel')
    // Note: The watcher will reset when modal closes
  }
}

// Add emoji/icons for emotions
const getEmotionIcon = (emotion: Emotion): string => {
  const icons: Record<Emotion, string> = {
    excited: '🤩',
    confident: '💪',
    motivated: '🔥',
    calm: '😌',
    neutral: '😐',
    nervous: '😬',
    anxious: '😰',
    overwhelmed: '😵',
    frustrated: '😤',
    dread: '😨',
    satisfied: '😊',
    relieved: '😮‍💨',
    accomplished: '🎉',
    disappointed: '😞'
  }
  return icons[emotion] || '💭'
}
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-content {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #1E1E1E;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #FFFFFF;
  word-break: break-word;
}

.modal-subtitle {
  margin: 0;
  color: #B3B3B3;
  font-size: 0.95rem;
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.emotion-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #4D4D4D;
  border-radius: 8px;
  background: #1E1E1E;
  cursor: pointer;
  transition: all 0.2s ease;
}

.emotion-button:hover {
  border-color: #BB86FC;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.emotion-button.selected {
  border-color: #BB86FC;
  background-color: #3700B3;
  transform: translateY(-2px);
}

.emotion-icon {
  font-size: 2rem;
  line-height: 1;
}

.emotion-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #FFFFFF;
  text-align: center;
}

.error-message {
  color: #CF6679;
  padding: 0.75rem;
  background-color: rgba(207, 102, 121, 0.1);
  border: 1px solid rgba(207, 102, 121, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.button-primary,
.button-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-primary {
  background-color: #BB86FC;
  color: #000000;
}

.button-primary:hover:not(:disabled) {
  background-color: #C693FC;
}

.button-primary:disabled {
  background-color: #4D4D4D;
  color: #808080;
  cursor: not-allowed;
  opacity: 0.6;
}

.button-secondary {
  background-color: transparent;
  color: #B3B3B3;
  border: 1px solid #4D4D4D;
}

.button-secondary:hover:not(:disabled) {
  background-color: #1E1E1E;
  color: #FFFFFF;
}

.button-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 640px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .emotion-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
  }

  .emotion-button {
    padding: 0.75rem 0.5rem;
  }

  .emotion-icon {
    font-size: 1.5rem;
  }

  .emotion-label {
    font-size: 0.8rem;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }
}
</style>

