<template>
  <div :style="cssVars">
    <div class="nudge-container">
      <TransitionGroup name="nudge" tag="div" class="nudge-list">
        <div
          v-for="nudge in nudgeStore.activeNudges"
          :key="nudge.nudgeId"
          class="nudge-card"
        >
          <div class="nudge-header">
            <div class="nudge-title">
              Time to get started!
              <span v-if="nudgeStore.nudgeQueue.length > 0" class="queue-badge">
                +{{ nudgeStore.nudgeQueue.length }} more
              </span>
            </div>
            <button class="nudge-close" @click="dismiss(nudge.nudgeId)" aria-label="Dismiss notification">
              ×
            </button>
          </div>
          
          <div class="nudge-body">
            <h4 class="task-title">{{ nudge.taskTitle }}</h4>
            <p class="nudge-message">{{ nudge.message }}</p>
          </div>
          
          <div class="nudge-actions">
            <BaseButton 
              @click="handleStart(nudge.taskId, nudge.taskTitle, nudge.nudgeId)"
              variant="primary"
              size="sm"
            >
              Start Task
            </BaseButton>
            <BaseButton 
              @click="dismiss(nudge.nudgeId)"
              variant="ghost"
              size="sm"
            >
              Dismiss
            </BaseButton>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Start Emotion Prompt Modal - Outside nudge container to avoid pointer-events issues -->
    <EmotionPromptModal
      :is-open="showStartEmotionModal"
      :task-id="currentTaskId"
      :task-title="currentTaskTitle"
      phase="before"
      :external-loading="startEmotionLoading"
      :external-error="startEmotionError"
      @submit="handleStartEmotionSubmit"
      @cancel="handleStartEmotionCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNudgeStore } from '../../stores/nudgeStore'
import { useTaskStore } from '../../stores/taskStore'
import { useEmotionStore } from '../../stores/emotionStore'
import type { Emotion } from '@/constants'
import { BaseButton } from '../base'
import EmotionPromptModal from '../emotions/EmotionPromptModal.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

const nudgeStore = useNudgeStore()
const taskStore = useTaskStore()
const emotionStore = useEmotionStore()

// State for emotion modal
const showStartEmotionModal = ref(false)
const currentTaskId = ref('')
const currentTaskTitle = ref('')
const currentNudgeId = ref('')
const startEmotionLoading = ref(false)
const startEmotionError = ref<string | null>(null)

function dismiss(nudgeId: string) {
  nudgeStore.dismissNudge(nudgeId)
}

function handleStart(taskId: string, taskTitle: string, nudgeId: string) {
  // Store the task info and show emotion modal
  currentTaskId.value = taskId
  currentTaskTitle.value = taskTitle
  currentNudgeId.value = nudgeId
  showStartEmotionModal.value = true
}

async function handleStartEmotionSubmit(emotion: Emotion) {
  startEmotionLoading.value = true
  startEmotionError.value = null
  
  try {
    // First, log the "before" emotion
    await emotionStore.logBefore({ 
      taskId: currentTaskId.value, 
      emotion 
    })
    
    // Then mark the task as started
    await taskStore.markStarted(currentTaskId.value)
    
    // Dismiss the nudge
    dismiss(currentNudgeId.value)
    
    // Success - close modal
    startEmotionLoading.value = false
    showStartEmotionModal.value = false
  } catch (err) {
    startEmotionLoading.value = false
    startEmotionError.value = err instanceof Error ? err.message : 'Failed to start task'
  }
}

function handleStartEmotionCancel() {
  showStartEmotionModal.value = false
  startEmotionError.value = null
}
</script>

<style scoped>
.nudge-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  pointer-events: none;
}

.nudge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nudge-card {
  background: var(--color-surface-variant);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-md);
  border-left: 4px solid var(--color-primary);
  pointer-events: auto;
  animation: slideIn var(--transition-normal);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nudge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.nudge-title {
  flex: 1;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.nudge-close {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-normal);
}

.nudge-close:hover {
  color: var(--color-text);
}

.nudge-body {
  margin-bottom: var(--spacing-md);
}

.task-title {
  margin: 0 0 8px 0;
  color: var(--color-primary);
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
}

.nudge-message {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  font-size: var(--font-size-sm);
}

.nudge-actions {
  display: flex;
  gap: 8px;
}

/* Transition animations */
.nudge-enter-active,
.nudge-leave-active {
  transition: all var(--transition-slow);
}

.nudge-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.nudge-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.nudge-move {
  transition: transform 0.3s ease;
}

/* Queue badge styling */
.queue-badge {
  display: inline-block;
  background: var(--color-in-progress);
  color: var(--color-text);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  font-weight: var(--font-weight-semibold);
  vertical-align: middle;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nudge-container {
    top: 60px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .nudge-card {
    padding: 12px;
  }
  
  .queue-badge {
    font-size: 10px;
    padding: 1px 5px;
  }
}
</style>

