<template>
  <div class="task-item" :class="[`task-${status}`, { 'task-completed': isCompleted }]" :style="cssVars">
    <div class="task-content">
      <div class="task-header">
        <h3 class="task-title">{{ task.title }}</h3>
        <span class="task-status" :class="`status-${status}`">
          {{ statusLabel }}
        </span>
      </div>

      <p v-if="task.description" class="task-description">
        {{ task.description }}
      </p>

      <div v-if="task.dueDate" class="task-due-date" :class="`due-${status}`">
        <strong>Due:</strong> {{ formattedDueDate }}
      </div>

      <div class="task-meta">
        <span class="task-date">Created: {{ formattedCreatedDate }}</span>
        <span v-if="task.startedAt" class="task-date">Started: {{ formattedStartedDate }}</span>
        <span v-if="task.completedAt" class="task-date">Completed: {{ formattedCompletedDate }}</span>
      </div>
    </div>

    <div class="task-actions">
      <BaseButton
        v-if="!isCompleted"
        @click="handleToggleStart"
        :disabled="isLoading"
        variant="ghost"
        size="sm"
      >
        {{ isStarted ? 'Mark Complete' : 'Start' }}
      </BaseButton>

      <BaseButton
        @click="handleDelete"
        :disabled="isLoading"
        variant="danger"
        size="sm"
      >
        Delete
      </BaseButton>
    </div>

    <!-- Start Emotion Prompt Modal -->
    <EmotionPromptModal
      :is-open="showStartEmotionModal"
      :task-id="task._id"
      :task-title="task.title"
      phase="before"
      :external-loading="startEmotionLoading"
      :external-error="startEmotionError"
      @submit="handleStartEmotionSubmit"
      @cancel="handleStartEmotionCancel"
    />

    <!-- Complete Emotion Prompt Modal -->
    <EmotionPromptModal
      :is-open="showCompleteEmotionModal"
      :task-id="task._id"
      :task-title="task.title"
      phase="after"
      :external-loading="completeEmotionLoading"
      :external-error="completeEmotionError"
      @submit="handleCompleteEmotionSubmit"
      @cancel="handleCompleteEmotionCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '../../stores/taskStore'
import type { Emotion } from '@/constants'
import { useTaskStore } from '../../stores/taskStore'
import { useEmotionStore } from '../../stores/emotionStore'
import EmotionPromptModal from '../emotions/EmotionPromptModal.vue'
import { BaseButton } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

// Props
const props = defineProps<{
  task: Task
}>()

// Emits
const emit = defineEmits<{
  'delete-task': [taskId: string]
}>()

// Stores
const taskStore = useTaskStore()
const emotionStore = useEmotionStore()

// State
const isLoading = ref(false)
const showStartEmotionModal = ref(false)
const showCompleteEmotionModal = ref(false)
const startEmotionLoading = ref(false)
const completeEmotionLoading = ref(false)
const startEmotionError = ref<string | null>(null)
const completeEmotionError = ref<string | null>(null)

// Computed properties
const status = computed((): 'pending' | 'in-progress' | 'completed' => {
  if (props.task.completedAt) return 'completed'
  if (props.task.startedAt) return 'in-progress'
  return 'pending'
})

const statusLabel = computed(() => {
  const labels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed'
  }
  return labels[status.value]
})

const isStarted = computed(() => !!props.task.startedAt)
const isCompleted = computed(() => !!props.task.completedAt)

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return ''
  return formatDate(new Date(props.task.dueDate))
})

const formattedCreatedDate = computed(() => {
  return formatDate(new Date(props.task.createdAt))
})

const formattedStartedDate = computed(() => {
  if (!props.task.startedAt) return ''
  return formatDate(new Date(props.task.startedAt))
})

const formattedCompletedDate = computed(() => {
  if (!props.task.completedAt) return ''
  return formatDate(new Date(props.task.completedAt))
})

// Methods
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

function handleToggleStart() {
  if (isStarted.value) {
    // If already started, show emotion prompt before completing
    showCompleteEmotionModal.value = true
  } else {
    // If not started, show emotion prompt before starting
    showStartEmotionModal.value = true
  }
}

async function handleStartEmotionSubmit(emotion: Emotion) {
  startEmotionLoading.value = true
  startEmotionError.value = null
  
  try {
    // First, log the "before" emotion
    await emotionStore.logBefore({ 
      taskId: props.task._id, 
      emotion 
    })
    
    // Then mark the task as started
    await taskStore.markStarted(props.task._id)
    
    // Success - close modal
    startEmotionLoading.value = false
    showStartEmotionModal.value = false
  } catch (err) {
    startEmotionLoading.value = false
    startEmotionError.value = err instanceof Error ? err.message : 'Failed to start task'
  }
}

async function handleCompleteEmotionSubmit(emotion: Emotion) {
  completeEmotionLoading.value = true
  completeEmotionError.value = null
  
  try {
    // First, log the "after" emotion
    await emotionStore.logAfter({ 
      taskId: props.task._id, 
      emotion 
    })
    
    // Then mark the task as completed
    await taskStore.markCompleted(props.task._id)
    
    // Success - close modal
    completeEmotionLoading.value = false
    showCompleteEmotionModal.value = false
  } catch (err) {
    completeEmotionLoading.value = false
    completeEmotionError.value = err instanceof Error ? err.message : 'Failed to complete task'
  }
}

function handleStartEmotionCancel() {
  showStartEmotionModal.value = false
  startEmotionError.value = null
}

function handleCompleteEmotionCancel() {
  showCompleteEmotionModal.value = false
  completeEmotionError.value = null
}

function handleDelete() {
  emit('delete-task', props.task._id)
}
</script>

<style scoped>
.task-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-variant);
  transition: all var(--transition-normal);
}

.task-item:hover {
  box-shadow: var(--shadow-md);
  background-color: var(--color-surface-container-high);
}

/* Status-based task styling */
.task-pending {
  box-shadow: 0 2px 8px rgba(255, 183, 77, 0.2);
  border-left: 3px solid var(--color-pending);
}

.task-in-progress {
  box-shadow: 0 2px 8px rgba(66, 165, 245, 0.2);
  border-left: 3px solid var(--color-in-progress);
}

.task-completed {
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.2);
  border-left: 3px solid var(--color-completed);
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.task-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  flex: 1;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pending {
  background-color: rgba(255, 183, 77, 0.1);
  color: var(--color-pending);
}

.status-in-progress {
  background-color: rgba(66, 165, 245, 0.1);
  color: var(--color-in-progress);
}

.status-completed {
  background-color: rgba(102, 187, 106, 0.1);
  color: var(--color-completed);
}

.task-description {
  margin: var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.task-due-date {
  margin: var(--spacing-sm) 0;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

/* Status-based due date styling */
.due-pending {
  background-color: rgba(255, 183, 77, 0.1);
  border-left: 3px solid var(--color-pending);
  color: var(--color-pending);
}

.due-in-progress {
  background-color: rgba(66, 165, 245, 0.1);
  border-left: 3px solid var(--color-in-progress);
  color: var(--color-in-progress);
}

.due-completed {
  background-color: rgba(102, 187, 106, 0.1);
  border-left: 3px solid var(--color-completed);
  color: var(--color-completed);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.task-date {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.task-actions {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .task-actions {
    flex-direction: column;
  }
}
</style>

