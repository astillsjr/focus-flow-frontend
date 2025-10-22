<template>
  <div class="task-item" :class="taskStatusClass">
    <div class="task-header">
      <h3 class="task-title">{{ task.title }}</h3>
      <div class="task-actions">
        <button
          v-if="!task.startedAt && !task.completedAt"
          @click="startTask"
          class="btn btn-sm btn-success"
          :disabled="isLoading"
        >
          Start
        </button>
        <button
          v-if="task.startedAt && !task.completedAt"
          @click="completeTask"
          class="btn btn-sm btn-primary"
          :disabled="isLoading"
        >
          Complete
        </button>
        <button
          @click="deleteTask"
          class="btn btn-sm btn-danger"
          :disabled="isLoading"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="task-content">
      <p v-if="task.description" class="task-description">{{ task.description }}</p>
      
      <div class="task-meta">
        <div class="task-dates">
          <div v-if="task.dueDate" class="due-date" :class="{ overdue: isOverdue }">
            <span class="date-icon">📅</span>
            <span class="date-text">
              Due: {{ formatDate(task.dueDate) }}
              <span v-if="isOverdue" class="overdue-text">(Overdue)</span>
            </span>
          </div>
          <div v-if="task.startedAt" class="started-date">
            <span class="date-icon">▶️</span>
            <span class="date-text">Started: {{ formatDate(task.startedAt) }}</span>
          </div>
          <div v-if="task.completedAt" class="completed-date">
            <span class="date-icon">✅</span>
            <span class="date-text">Completed: {{ formatDate(task.completedAt) }}</span>
          </div>
        </div>
      </div>

      <div class="task-status">
        <span class="status-badge" :class="statusBadgeClass">{{ statusText }}</span>
        <div v-if="isOverdue && !task.completedAt" class="overdue-warning">
          ⚠️ Overdue
        </div>
      </div>
    </div>

    <div class="task-footer">
      <div class="task-tags">
        <span v-if="task.dueDate" class="tag tag-due">Has Due Date</span>
        <span v-if="task.startedAt" class="tag tag-started">Started</span>
        <span v-if="task.completedAt" class="tag tag-completed">Completed</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import type { TaskDoc } from '@/types/api'

const props = defineProps<{
  task: TaskDoc
}>()

const emit = defineEmits<{
  'task-updated': [task: TaskDoc]
  'task-deleted': [taskId: string]
  'task-started': [taskId: string]
  'task-completed': [taskId: string]
}>()

const tasksStore = useTasksStore()

// Computed properties
const isLoading = computed(() => tasksStore.isLoading)

const taskStatusClass = computed(() => {
  if (props.task.completedAt) return 'completed'
  if (props.task.startedAt) return 'in-progress'
  return 'pending'
})

const statusText = computed(() => {
  if (props.task.completedAt) return 'Completed'
  if (props.task.startedAt) return 'In Progress'
  return 'Pending'
})

const statusBadgeClass = computed(() => {
  switch (taskStatusClass.value) {
    case 'completed':
      return 'status-completed'
    case 'in-progress':
      return 'status-in-progress'
    default:
      return 'status-pending'
  }
})

const isOverdue = computed(() => {
  return props.task.dueDate && 
         new Date(props.task.dueDate) < new Date() && 
         !props.task.completedAt
})

// Methods
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const startTask = async () => {
  const success = await tasksStore.markTaskStarted(props.task._id)
  if (success) {
    emit('task-started', props.task._id)
  }
}

const completeTask = async () => {
  const success = await tasksStore.markTaskComplete(props.task._id)
  if (success) {
    emit('task-completed', props.task._id)
  }
}

const deleteTask = async () => {
  if (confirm(`Are you sure you want to delete "${props.task.title}"?`)) {
    const success = await tasksStore.deleteTask(props.task._id)
    if (success) {
      emit('task-deleted', props.task._id)
    }
  }
}
</script>

<style scoped>
.task-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #ddd;
  transition: all 0.3s ease;
  position: relative;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.task-item.pending {
  border-left-color: #ffc107;
}

.task-item.in-progress {
  border-left-color: #007bff;
}

.task-item.completed {
  border-left-color: #28a745;
  opacity: 0.9;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.task-title {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
  flex: 1;
  line-height: 1.3;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.task-content {
  margin-bottom: 1rem;
}

.task-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.task-meta {
  margin-bottom: 1rem;
}

.task-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.due-date, .started-date, .completed-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.due-date.overdue {
  color: #dc3545;
  font-weight: 500;
}

.date-icon {
  font-size: 1rem;
}

.overdue-text {
  color: #dc3545;
  font-weight: bold;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-in-progress {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.overdue-warning {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.task-footer {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.task-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-due {
  background-color: #e3f2fd;
  color: #1565c0;
}

.tag-started {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.tag-completed {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-actions {
    justify-content: center;
  }
  
  .task-dates {
    font-size: 0.85rem;
  }
}
</style>
