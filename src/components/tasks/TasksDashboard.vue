<template>
  <DashboardLayout>
    <!-- Header with title and greeting -->
    <div class="dashboard-header">
      <h1>Your Tasks</h1>
      <p style="margin: 0.25rem 0 0; color: #B3B3B3;">Welcome, {{ displayUsername }}</p>
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

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #FFFFFF;
}

/* Create Task Section */
.create-task-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-state p {
  font-size: 1.1rem;
  color: #808080;
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

/* Task List Container */
.task-list-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.active-tasks {
  animation: fadeIn 0.3s ease-in;
}

.active-tasks h2,
.history-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #FFFFFF;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #808080;
  font-style: italic;
}

.task-group {
  background-color: #1E1E1E;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #4D4D4D;
  margin-bottom: 1rem;
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
}

.total-count {
  color: #757575;
  font-size: 0.9rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.page-info {
  color: #666666;
  font-size: 0.9rem;
  font-weight: 500;
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

