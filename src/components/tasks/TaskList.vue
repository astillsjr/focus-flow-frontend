<template>
  <div class="task-list">
    <div class="task-list-header">
      <h2>Your Tasks</h2>
      <button @click="refreshTasks" :disabled="isLoading" class="refresh-button">
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !tasks.length" class="loading-state">
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="refreshTasks" class="retry-button">Try Again</button>
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
        <div class="task-items">
          <TaskItem
            v-for="task in pendingTasks"
            :key="task._id"
            :task="task"
            @delete-task="handleDeleteTask"
          />
        </div>
      </div>

      <!-- In Progress Tasks -->
      <div v-if="inProgressTasks.length > 0" class="task-group">
        <h3 class="group-title">
          In Progress <span class="task-count">({{ inProgressTasks.length }})</span>
        </h3>
        <div class="task-items">
          <TaskItem
            v-for="task in inProgressTasks"
            :key="task._id"
            :task="task"
            @delete-task="handleDeleteTask"
          />
        </div>
      </div>

      <!-- Completed Tasks -->
      <div v-if="completedTasks.length > 0" class="task-group">
        <h3 class="group-title">
          Completed <span class="task-count">({{ completedTasks.length }})</span>
        </h3>
        <div class="task-items">
          <TaskItem
            v-for="task in completedTasks"
            :key="task._id"
            :task="task"
            @delete-task="handleDeleteTask"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import TaskItem from './TaskItem.vue'

// Get task store
const taskStore = useTaskStore()

// Local state for tracking operations
const isRefreshing = ref(false)

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
    console.log('✅ Tasks refreshed successfully')
  } catch (err) {
    console.error('❌ Failed to refresh tasks:', err)
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
    console.log('✅ Task completed:', taskId)
  } catch (err) {
    console.error('❌ Failed to complete task:', err)
    // Optionally show error notification
  }
}

/**
 * Handle delete task event from TaskItem
 */
async function handleDeleteTask(taskId: string) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return
  }

  try {
    await taskStore.deleteTask(taskId)
    console.log('✅ Task deleted:', taskId)
  } catch (err) {
    console.error('❌ Failed to delete task:', err)
    // Optionally show error notification
  }
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
  border-bottom: 2px solid #e0e0e0;
}

.task-list-header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: #333;
}

.refresh-button {
  padding: 0.5rem 1rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.refresh-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #757575;
}

.loading-state p,
.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.error-state {
  color: #d32f2f;
}

.error-state p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #d32f2f;
}

.task-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.task-group {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.group-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-count {
  font-size: 0.9rem;
  color: #757575;
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
    align-items: stretch;
  }

  .refresh-button {
    width: 100%;
  }

  .task-group {
    padding: 1rem;
  }
}
</style>

