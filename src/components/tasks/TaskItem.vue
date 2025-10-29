<template>
  <div class="task-item" :class="{ 'task-completed': isCompleted }">
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

      <div v-if="task.dueDate" class="task-due-date">
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
        variant="primary"
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
import type { Emotion } from '@/stores/emotionStore'
import { useTaskStore } from '../../stores/taskStore'
import { useEmotionStore } from '../../stores/emotionStore'
import EmotionPromptModal from '../emotions/EmotionPromptModal.vue'
import { BaseButton } from '../base'

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
    console.log('✅ Before emotion logged:', emotion)
    
    // Then mark the task as started
    await taskStore.markStarted(props.task._id)
    console.log('✅ Task started:', props.task._id)
    
    // Success - close modal
    startEmotionLoading.value = false
    showStartEmotionModal.value = false
  } catch (err) {
    console.error('❌ Failed to start task with emotion:', err)
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
    console.log('✅ After emotion logged:', emotion)
    
    // Then mark the task as completed
    await taskStore.markCompleted(props.task._id)
    console.log('✅ Task completed:', props.task._id)
    
    // Success - close modal
    completeEmotionLoading.value = false
    showCompleteEmotionModal.value = false
  } catch (err) {
    console.error('❌ Failed to complete task with emotion:', err)
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
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-completed {
  background-color: #f9f9f9;
  border-left: 3px solid #4CAF50;
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-in-progress {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.task-description {
  margin: 0.5rem 0;
  color: #555;
  line-height: 1.5;
}

.task-due-date {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #fff9c4;
  border-left: 3px solid #fbc02d;
  border-radius: 4px;
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
}

.task-date {
  font-size: 0.85rem;
  color: #757575;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .task-actions {
    flex-direction: column;
  }
}
</style>

