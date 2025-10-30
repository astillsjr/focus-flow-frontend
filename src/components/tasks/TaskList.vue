<template>
  <div class="task-list">
    <div class="task-list-header">
      <h2>Your Tasks</h2>
      <BaseButton 
        @click="refreshTasks" 
        :loading="isLoading"
        variant="secondary"
        size="sm"
      >
        Refresh
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !tasks.length" class="loading-state">
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <BaseButton @click="refreshTasks" variant="danger">
        Try Again
      </BaseButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="!tasks.length" class="empty-state">
      <p>No tasks yet. Create your first task to get started!</p>
    </div>

    <!-- Task Groups -->
    <div v-else class="task-groups">
      <!-- Pending Tasks -->
      <div v-if="pendingTasks.length > 0" class="task-group">
        <h3 class="group-title">
          Pending <span class="task-count">({{ pendingTasks.length }})</span>
        </h3>
        <TransitionGroup name="task-list" tag="div" class="task-items">
          <TaskItem
            v-for="task in pendingTasks"
            :key="task._id"
            :task="task"
            @delete-task="handleDeleteTask"
          />
        </TransitionGroup>
      </div>

      <!-- In Progress Tasks -->
      <div v-if="inProgressTasks.length > 0" class="task-group">
        <h3 class="group-title">
          In Progress <span class="task-count">({{ inProgressTasks.length }})</span>
        </h3>
        <TransitionGroup name="task-list" tag="div" class="task-items">
          <TaskItem
            v-for="task in inProgressTasks"
            :key="task._id"
            :task="task"
            @delete-task="handleDeleteTask"
          />
        </TransitionGroup>
      </div>

      <!-- Completed Tasks -->
      <div v-if="completedTasks.length > 0" class="task-group">
        <h3 class="group-title">
          Completed <span class="task-count">({{ completedTasks.length }})</span>
        </h3>
        <TransitionGroup name="task-list" tag="div" class="task-items">
          <TaskItem
            v-for="task in completedTasks"
            :key="task._id"
            :task="task"
            @delete-task="handleDeleteTask"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <BaseConfirmModal
      :is-open="showDeleteModal"
      title="Delete Task"
      :message="deleteMessage"
      confirm-text="Delete"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import TaskItem from './TaskItem.vue'
import { BaseButton, BaseConfirmModal } from '../base'

// Get task store
const taskStore = useTaskStore()

// Local state for tracking operations
const isRefreshing = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const taskToDelete = ref<string | null>(null)
const deleteMessage = ref('')

// Computed properties from store
const tasks = computed(() => taskStore.tasks)
const pendingTasks = computed(() => taskStore.pendingTasks)
const inProgressTasks = computed(() => taskStore.inProgressTasks)
const completedTasks = computed(() => taskStore.completedTasks)
const isLoading = computed(() => taskStore.isLoading || isRefreshing.value)
const error = computed(() => taskStore.error)

/**
 * Fetch/refresh tasks from the API
 */
async function refreshTasks() {
  try {
    isRefreshing.value = true
    await taskStore.fetchTasks()
  } catch (err) {
  } finally {
    isRefreshing.value = false
  }
}

/**
 * Handle toggle complete event from TaskItem (legacy - not used with emotion flow)
 */
async function handleToggleComplete(taskId: string) {
  try {
    await taskStore.markCompleted(taskId)
  } catch (err) {
    // Optionally show error notification
  }
}

/**
 * Handle delete task event - show confirmation modal
 */
function handleDeleteTask(taskId: string) {
  const task = tasks.value.find(t => t._id === taskId)
  if (task) {
    taskToDelete.value = taskId
    deleteMessage.value = `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
    showDeleteModal.value = true
  }
}

/**
 * Confirm delete task
 */
async function confirmDelete() {
  if (!taskToDelete.value) return
  
  isDeleting.value = true
  
  try {
    await taskStore.deleteTask(taskToDelete.value)
    showDeleteModal.value = false
    taskToDelete.value = null
  } catch (err) {
    // Keep modal open on error so user can try again
  } finally {
    isDeleting.value = false
  }
}

/**
 * Cancel delete task
 */
function cancelDelete() {
  showDeleteModal.value = false
  taskToDelete.value = null
  isDeleting.value = false
}

// Initialize tasks on component mount
onMounted(async () => {
  await refreshTasks()
})

// Expose refresh method so parent components can trigger refresh
defineExpose({
  refreshTasks
})
</script>

<style scoped>
/* Task List Transitions */
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.4s ease;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-list-move {
  transition: transform 0.4s ease;
}

.task-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #4D4D4D;
}

.task-list-header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: #FFFFFF;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #808080;
}

.loading-state p,
.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #CF6679;
}

.error-state p {
  font-size: 1.1rem;
  margin: 0;
}

.task-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.task-group {
  background-color: #1E1E1E;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #4D4D4D;
}

.group-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-count {
  font-size: 0.9rem;
  color: #808080;
  font-weight: normal;
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .task-list {
    padding: 0.5rem;
  }

  .task-list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .task-group {
    padding: 1rem;
  }
}
</style>

