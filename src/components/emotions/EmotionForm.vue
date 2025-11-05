<template>
  <div class="emotion-form" :style="cssVars">
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
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

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
  margin-bottom: var(--spacing-md);
}

label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

select:disabled {
  background-color: var(--color-background-muted);
  cursor: not-allowed;
}

.error {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: rgba(207, 102, 121, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-sm);
}
</style>
