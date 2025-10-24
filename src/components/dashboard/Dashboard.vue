<template>
  <div class="dashboard">
    <!-- Header with username -->
    <div class="dashboard-header">
      <h1>Welcome, {{ displayUsername }}</h1>
      <button @click="handleLogout" class="logout-button">Logout</button>
    </div>

    <!-- Create Task Section -->
    <div class="create-task-section">
      <button @click="toggleTaskForm" class="toggle-form-button">
        {{ showTaskForm ? 'Hide Task Form' : '+ Create New Task' }}
      </button>
      
      <div v-if="showTaskForm" class="task-form-container">
        <TaskForm @submit-task="handleTaskSubmit" />
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button @click="handleRefresh" :disabled="isLoading" class="refresh-button">
        {{ isLoading ? 'Loading...' : 'Refresh Tasks' }}
      </button>
      <button @click="toggleHistory" class="history-button">
        {{ showHistory ? 'Hide History' : 'Show History' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !tasks.length" class="loading-state">
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="handleRefresh" class="retry-button">Try Again</button>
    </div>

    <!-- Task List -->
    <div v-else class="task-list-container">
      <!-- Active Tasks (Pending + In Progress) -->
      <div class="active-tasks">
        <h2>Active Tasks</h2>
        <div v-if="!pendingTasks.length && !inProgressTasks.length" class="empty-message">
          <p>No active tasks. Create a task to get started!</p>
        </div>
        <div v-else>
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
                @toggle-start="handleToggleStart"
                @toggle-complete="handleToggleComplete"
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
                @toggle-start="handleToggleStart"
                @toggle-complete="handleToggleComplete"
                @delete-task="handleDeleteTask"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- History (Completed Tasks) -->
      <div v-if="showHistory" class="history-section">
        <h2>History</h2>
        <div v-if="!completedTasks.length" class="empty-message">
          <p>No completed tasks yet.</p>
        </div>
        <div v-else class="task-group">
          <h3 class="group-title">
            Completed <span class="task-count">({{ completedTasks.length }})</span>
          </h3>
          <div class="task-items">
            <TaskItem
              v-for="task in completedTasks"
              :key="task._id"
              :task="task"
              @toggle-start="handleToggleStart"
              @toggle-complete="handleToggleComplete"
              @delete-task="handleDeleteTask"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import TaskForm from '../tasks/TaskForm.vue'
import TaskItem from '../tasks/TaskItem.vue'

// Get stores and router
const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()

// Local state
const showTaskForm = ref(false)
const showHistory = ref(false)

// Computed properties
const tasks = computed(() => taskStore.tasks)
const pendingTasks = computed(() => taskStore.pendingTasks)
const inProgressTasks = computed(() => taskStore.inProgressTasks)
const completedTasks = computed(() => taskStore.completedTasks)
const isLoading = computed(() => taskStore.isLoading)
const error = computed(() => taskStore.error)
const displayUsername = computed(() => authStore.username || 'User')

/**
 * Toggle task form visibility
 */
function toggleTaskForm() {
  showTaskForm.value = !showTaskForm.value
}

/**
 * Toggle history visibility
 */
function toggleHistory() {
  showHistory.value = !showHistory.value
}

/**
 * Handle task submission
 */
function handleTaskSubmit(taskId: string) {
  console.log('✅ Task created:', taskId)
  // Optionally hide the form after successful submission
  showTaskForm.value = false
}

/**
 * Refresh tasks
 */
async function handleRefresh() {
  try {
    await taskStore.fetchTasks()
    console.log('✅ Tasks refreshed successfully')
  } catch (err) {
    console.error('❌ Failed to refresh tasks:', err)
  }
}

/**
 * Handle toggle start event
 */
async function handleToggleStart(taskId: string) {
  try {
    await taskStore.markStarted(taskId)
    console.log('✅ Task started:', taskId)
  } catch (err) {
    console.error('❌ Failed to start task:', err)
  }
}

/**
 * Handle toggle complete event
 */
async function handleToggleComplete(taskId: string) {
  try {
    await taskStore.markCompleted(taskId)
    console.log('✅ Task completed:', taskId)
  } catch (err) {
    console.error('❌ Failed to complete task:', err)
  }
}

/**
 * Handle delete task event
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
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/login')
    console.log('✅ Logged out successfully')
  } catch (err) {
    console.error('❌ Logout error:', err)
  }
}

// Initialize tasks on component mount
onMounted(async () => {
  await handleRefresh()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #757575;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #616161;
}

/* Create Task Section */
.create-task-section {
  margin-bottom: 2rem;
}

.toggle-form-button {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-form-button:hover {
  background-color: #45a049;
}

.task-form-container {
  margin-top: 1rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

/* Controls */
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.refresh-button,
.history-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button {
  background-color: #2196F3;
  color: white;
}

.refresh-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.refresh-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.history-button {
  background-color: #FF9800;
  color: white;
}

.history-button:hover {
  background-color: #F57C00;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-state p {
  font-size: 1.1rem;
  color: #757575;
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
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #d32f2f;
}

/* Task List Container */
.task-list-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.active-tasks h2,
.history-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #333;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #757575;
  font-style: italic;
}

.task-group {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 1rem;
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

/* History Section */
.history-section {
  border-top: 2px solid #e0e0e0;
  padding-top: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem 0.5rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .logout-button {
    width: 100%;
  }

  .controls {
    flex-direction: column;
  }

  .refresh-button,
  .history-button {
    width: 100%;
  }

  .task-group {
    padding: 1rem;
  }
}
</style>

