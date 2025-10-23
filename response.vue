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
      <button
        v-if="!isCompleted"
        @click="handleToggleStart"
        class="action-button start-button"
        :disabled="isLoading"
      >
        {{ isStarted ? 'Mark Complete' : 'Start' }}
      </button>

      <button
        @click="handleDelete"
        class="action-button delete-button"
        :disabled="isLoading"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '../../stores/taskStore'

// Props
const props = defineProps<{
  task: Task
}>()

// Emits
const emit = defineEmits<{
  'toggle-start': [taskId: string]
  'toggle-complete': [taskId: string]
  'delete-task': [taskId: string]
}>()

// State
const isLoading = ref(false)

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
    // If already started, mark as complete
    emit('toggle-complete', props.task._id)
  } else {
    // If not started, mark as started
    emit('toggle-start', props.task._id)
  }
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
  opacity: 0.6;
  background-color: #f5f5f5;
}

.task-completed .task-title,
.task-completed .task-description {
  text-decoration: line-through;
  color: #757575;
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

.action-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-button {
  background-color: #4CAF50;
  color: white;
}

.start-button:hover:not(:disabled) {
  background-color: #45a049;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #d32f2f;
}
</style>

