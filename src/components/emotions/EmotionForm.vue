<template>
  <div class="emotion-form">
    <h3>{{ title }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="emotion-select">
          {{ phase === 'before' ? 'How do you feel about this task?' : 'How do you feel after completing this task?' }}
        </label>
        <select 
          id="emotion-select"
          v-model="selectedEmotion" 
          required
          :disabled="isLoading"
        >
          <option value="" disabled>Select an emotion</option>
          <option 
            v-for="emotion in VALID_EMOTIONS" 
            :key="emotion" 
            :value="emotion"
          >
            {{ EMOTION_LABELS[emotion] }}
          </option>
        </select>
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <BaseButton 
        type="submit" 
        :disabled="!selectedEmotion"
        :loading="isLoading"
      >
        Log Emotion
      </BaseButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEmotionStore } from '@/stores/emotionStore'
import { VALID_EMOTIONS, EMOTION_LABELS, type Emotion } from '@/constants'
import { BaseButton } from '../base'

// Props
const props = defineProps<{
  taskId: string
  phase: 'before' | 'after'
}>()

// Emits
const emit = defineEmits<{
  logged: [emotionLogId: string]
  error: [error: Error]
}>()

// Store
const emotionStore = useEmotionStore()

// State
const selectedEmotion = ref<Emotion | ''>('')
const error = ref<string | null>(null)

// Computed
const isLoading = computed(() => emotionStore.isLoading)
const title = computed(() => 
  props.phase === 'before' ? 'Log Initial Emotion' : 'Log Completion Emotion'
)

// Methods
const handleSubmit = async () => {
  if (!selectedEmotion.value) return

  error.value = null

  try {
    const logId = props.phase === 'before'
      ? await emotionStore.logBefore({ 
          taskId: props.taskId, 
          emotion: selectedEmotion.value 
        })
      : await emotionStore.logAfter({ 
          taskId: props.taskId, 
          emotion: selectedEmotion.value 
        })
    
    emit('logged', logId)
    selectedEmotion.value = '' // Reset form
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to log emotion'
    error.value = errorMessage
    emit('error', err instanceof Error ? err : new Error(errorMessage))
  }
}
</script>

<style scoped>
.emotion-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #4D4D4D;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #1E1E1E;
  color: #FFFFFF;
}

select:disabled {
  background-color: #0F0F0F;
  cursor: not-allowed;
}

.error {
  color: #CF6679;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #3d1a1a;
  border: 1px solid #CF6679;
  border-radius: 4px;
}
</style>
