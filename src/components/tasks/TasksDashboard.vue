<template>
  <DashboardLayout>
    <!-- Header with title and greeting -->
    <div class="dashboard-header" :style="cssVars">
      <h1>Your Tasks</h1>
      <p class="welcome-text">Welcome, {{ displayUsername }}</p>
    </div>

    <!-- Create Task Section -->
    <div class="create-task-section">
      <BaseButton @click="goToCreateTask" variant="primary" size="lg">
        + Create New Task
      </BaseButton>
      <BaseButton 
        @click="toggleView"
        variant="ghost"
        size="lg"
      >
        {{ showHistory ? 'Show Active' : 'Show History' }}
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !tasks.length" class="loading-state">
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <BaseButton @click="handleRefresh" variant="danger">
        Try Again
      </BaseButton>
    </div>

    <!-- Task List -->
    <div v-else class="task-list-container">
      <!-- Active Tasks (Pending + In Progress) -->
      <div v-if="!showHistory" class="active-tasks">
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
      <div v-else class="history-section">
        <div class="history-header">
          <h2>History</h2>
          <span class="total-count">{{ completedTasks.length }} completed tasks</span>
        </div>
        
        <div v-if="!completedTasks.length" class="empty-message">
          <p>No completed tasks yet.</p>
        </div>
        
        <div v-else>
          <div class="task-group">
            <div class="task-items">
              <TaskItem
                v-for="task in paginatedCompletedTasks"
                :key="task._id"
                :task="task"
                @toggle-start="handleToggleStart"
                @toggle-complete="handleToggleComplete"
                @delete-task="handleDeleteTask"
              />
            </div>
          </div>
          
          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="pagination">
            <BaseButton 
              @click="previousPage"
              :disabled="currentPage === 1"
              variant="ghost"
              size="sm"
            >
              Previous
            </BaseButton>
            
            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <BaseButton 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              variant="ghost"
              size="sm"
            >
              Next
            </BaseButton>
          </div>
        </div>
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
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import DashboardLayout from '../layout/DashboardLayout.vue'
import TaskItem from './TaskItem.vue'
import { BaseButton, BaseConfirmModal } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

// Get stores and router
const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()

// Local state
const showHistory = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const taskToDelete = ref<string | null>(null)
const deleteMessage = ref('')

// Computed properties
const tasks = computed(() => taskStore.tasks)
const pendingTasks = computed(() => taskStore.pendingTasks)
const inProgressTasks = computed(() => taskStore.inProgressTasks)
const completedTasks = computed(() => taskStore.completedTasks)
const isLoading = computed(() => taskStore.isLoading)
const error = computed(() => taskStore.error)
const displayUsername = computed(() => authStore.username || 'User')

// Pagination computed properties
const totalPages = computed(() => Math.ceil(completedTasks.value.length / itemsPerPage))
const paginatedCompletedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return completedTasks.value.slice(start, end)
})

/**
 * Navigate to task creation flow
 */
function goToCreateTask() {
  router.push('/tasks/create')
}

/**
 * Toggle between active tasks and history view
 */
function toggleView() {
  showHistory.value = !showHistory.value
  currentPage.value = 1 // Reset to first page when switching views
}

/**
 * Go to previous page
 */
function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

/**
 * Go to next page
 */
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

/**
 * Refresh tasks
 */
async function handleRefresh() {
  try {
    await taskStore.fetchTasks()
  } catch (err) {
  }
}

/**
 * Handle toggle start event
 */
async function handleToggleStart(taskId: string) {
  try {
    await taskStore.markStarted(taskId)
  } catch (err) {
  }
}

/**
 * Handle toggle complete event
 */
async function handleToggleComplete(taskId: string) {
  try {
    await taskStore.markCompleted(taskId)
  } catch (err) {
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
  await handleRefresh()
})
</script>

<style scoped>
/* Header */
.dashboard-header {
  margin-bottom: 2rem;
}

.welcome-text {
  margin: 0.25rem 0 0;
  color: var(--color-text-secondary);
}

.dashboard-header h1 {
  margin: 0;
  font-size: var(--font-size-display);
  color: var(--color-text);
}

/* Create Task Section */
.create-task-section {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: var(--spacing-xxxl) var(--spacing-md);
}

.loading-state p {
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-error);
}

.error-state p {
  font-size: 1.1rem;
  margin: 0;
}

/* Task List Container */
.task-list-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.active-tasks {
  animation: fadeIn var(--transition-normal);
}

.active-tasks h2,
.history-section h2 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-xxl);
  color: var(--color-text);
}

.empty-message {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
  font-style: italic;
}

.task-group {
  background-color: var(--color-surface-variant);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.group-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-xl);
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.task-count {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-normal);
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* History Section */
.history-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.history-header h2 {
  margin: 0;
  color: var(--color-text);
}

.total-count {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.page-info {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-task-section {
    flex-direction: column;
  }

  .task-group {
    padding: 1rem;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

