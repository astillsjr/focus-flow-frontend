<template>
  <div class="focus-flow-dashboard">
    <div class="dashboard-header">
      <h1>Focus Flow Dashboard</h1>
      <div class="dashboard-controls">
        <button @click="refreshAll" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-small"></span>
          {{ isLoading ? 'Refreshing...' : 'Refresh All' }}
        </button>
      </div>
    </div>

    <!-- Quick Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-number">{{ taskStats.total }}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-number">{{ taskStats.completed }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">😊</div>
        <div class="stat-content">
          <div class="stat-number">{{ emotionStats.total }}</div>
          <div class="stat-label">Emotions Logged</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎲</div>
        <div class="stat-content">
          <div class="stat-number">{{ betStats.total }}</div>
          <div class="stat-label">Bets Placed</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-number">{{ nudgeStats.total }}</div>
          <div class="stat-label">Nudges Scheduled</div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Task Management Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Task Management</h2>
          <div class="section-controls">
            <button @click="showTaskForm = true" class="btn btn-sm btn-primary">
              + Add Task
            </button>
          </div>
        </div>
        <div class="section-content">
          <TaskList
            @task-started="handleTaskStarted"
            @task-completed="handleTaskCompleted"
          />
        </div>
      </div>

      <!-- Emotion Tracking Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Emotion Tracking</h2>
          <div class="section-controls">
            <button @click="showEmotionHistory = !showEmotionHistory" class="btn btn-sm btn-secondary">
              {{ showEmotionHistory ? 'Hide' : 'Show' }} History
            </button>
          </div>
        </div>
        <div class="section-content">
          <div v-if="!showEmotionHistory">
            <EmotionTracker
              :selected-task="selectedTask"
              :current-phase="currentPhase"
              @emotion-logged="handleEmotionLogged"
              @phase-completed="handlePhaseCompleted"
            />
          </div>
          <div v-else>
            <EmotionHistory />
          </div>
        </div>
      </div>

      <!-- Micro Betting Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Micro Betting</h2>
          <div class="section-controls">
            <button @click="showBetHistory = !showBetHistory" class="btn btn-sm btn-secondary">
              {{ showBetHistory ? 'Hide' : 'Show' }} History
            </button>
          </div>
        </div>
        <div class="section-content">
          <div v-if="!showBetHistory">
            <BettingInterface
              :selected-task="selectedTask"
              @bet-placed="handleBetPlaced"
              @bet-canceled="handleBetCanceled"
              @bet-resolved="handleBetResolved"
            />
          </div>
          <div v-else>
            <BetHistory />
          </div>
        </div>
      </div>

      <!-- Nudge Engine Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Nudge Engine</h2>
          <div class="section-controls">
            <button @click="showNudgeDisplay = !showNudgeDisplay" class="btn btn-sm btn-secondary">
              {{ showNudgeDisplay ? 'Hide' : 'Show' }} All Nudges
            </button>
          </div>
        </div>
        <div class="section-content">
          <div v-if="!showNudgeDisplay">
            <NudgeScheduler
              :selected-task="selectedTask"
              @nudge-scheduled="handleNudgeScheduled"
              @nudge-canceled="handleNudgeCanceled"
              @nudge-triggered="handleNudgeTriggered"
            />
          </div>
          <div v-else>
            <NudgeDisplay />
          </div>
        </div>
      </div>
    </div>

    <!-- Task Selection Modal -->
    <div v-if="showTaskSelection" class="modal-overlay" @click="showTaskSelection = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Select a Task</h3>
          <button @click="showTaskSelection = false" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="task-selection-list">
            <div
              v-for="task in availableTasks"
              :key="task._id"
              @click="selectTask(task)"
              class="task-selection-item"
              :class="{ selected: selectedTask?._id === task._id }"
            >
              <div class="task-info">
                <h4>{{ task.title }}</h4>
                <p>{{ task.description || 'No description' }}</p>
                <div class="task-meta">
                  <span class="task-status" :class="getTaskStatusClass(task)">
                    {{ getTaskStatusText(task) }}
                  </span>
                  <span v-if="task.dueDate" class="task-due">
                    Due: {{ formatDate(task.dueDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Form Modal -->
    <TaskForm
      v-if="showTaskForm"
      @task-created="handleTaskCreated"
      @form-closed="showTaskForm = false"
    />

    <!-- Global Error Display -->
    <div v-if="globalError" class="global-error">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">{{ globalError }}</span>
        <button @click="globalError = null" class="error-close">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useEmotionsStore } from '@/stores/emotions'
import { useBetsStore } from '@/stores/bets'
import { useNudgesStore } from '@/stores/nudges'
import TaskList from './TaskList.vue'
import TaskForm from './TaskForm.vue'
import EmotionTracker from './EmotionTracker.vue'
import EmotionHistory from './EmotionHistory.vue'
import BettingInterface from './BettingInterface.vue'
import BetHistory from './BetHistory.vue'
import NudgeScheduler from './NudgeScheduler.vue'
import NudgeDisplay from './NudgeDisplay.vue'
import type { TaskDoc } from '@/types/api'

// Store instances
const tasksStore = useTasksStore()
const emotionsStore = useEmotionsStore()
const betsStore = useBetsStore()
const nudgesStore = useNudgesStore()

// Local state
const selectedTask = ref<TaskDoc | null>(null)
const currentPhase = ref<'before' | 'after' | null>(null)
const showTaskSelection = ref(false)
const showTaskForm = ref(false)
const showEmotionHistory = ref(false)
const showBetHistory = ref(false)
const showNudgeDisplay = ref(false)
const globalError = ref<string | null>(null)

// Computed properties
const isLoading = computed(() => 
  tasksStore.isLoading || 
  emotionsStore.isLoading || 
  betsStore.isLoading || 
  nudgesStore.isLoading
)

const availableTasks = computed(() => tasksStore.tasks)

const taskStats = computed(() => ({
  total: tasksStore.tasks.length,
  pending: tasksStore.pendingTasks.length,
  inProgress: tasksStore.inProgressTasks.length,
  completed: tasksStore.completedTasks.length
}))

const emotionStats = computed(() => ({
  total: emotionsStore.emotionLogs.length,
  before: emotionsStore.beforeEmotions.length,
  after: emotionsStore.afterEmotions.length
}))

const betStats = computed(() => ({
  total: betsStore.bets.length,
  pending: betsStore.pendingBets.length,
  successful: betsStore.successfulBets.length,
  failed: betsStore.failedBets.length
}))

const nudgeStats = computed(() => ({
  total: nudgesStore.nudges.length,
  scheduled: nudgesStore.scheduledNudges.length,
  triggered: nudgesStore.triggeredNudges.length,
  ready: nudgesStore.readyNudges.length
}))

// Methods
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

const getTaskStatusClass = (task: TaskDoc) => {
  if (task.completedAt) return 'status-completed'
  if (task.startedAt) return 'status-in-progress'
  return 'status-pending'
}

const getTaskStatusText = (task: TaskDoc) => {
  if (task.completedAt) return 'Completed'
  if (task.startedAt) return 'In Progress'
  return 'Pending'
}

const selectTask = (task: TaskDoc) => {
  selectedTask.value = task
  showTaskSelection.value = false
  
  // Determine current phase based on task status
  if (task.startedAt && !task.completedAt) {
    currentPhase.value = 'after'
  } else if (!task.startedAt) {
    currentPhase.value = 'before'
  } else {
    currentPhase.value = null
  }
}

const refreshAll = async () => {
  try {
    await Promise.all([
      tasksStore.fetchUserTasks(),
      emotionsStore.fetchEmotionTrends(),
      betsStore.fetchBetHistory(),
      // nudgesStore.fetchNudges() // This would be implemented in the store
    ])
  } catch (error) {
    globalError.value = 'Failed to refresh data. Please try again.'
    console.error('Refresh error:', error)
  }
}

// Event handlers
const handleTaskStarted = (taskId: string) => {
  console.log('Task started:', taskId)
  // Update current phase to 'after' if this is the selected task
  if (selectedTask.value?._id === taskId) {
    currentPhase.value = 'after'
  }
}

const handleTaskCompleted = (taskId: string) => {
  console.log('Task completed:', taskId)
  // Clear current phase if this is the selected task
  if (selectedTask.value?._id === taskId) {
    currentPhase.value = null
  }
}

const handleTaskCreated = () => {
  showTaskForm.value = false
  console.log('Task created')
}

const handleEmotionLogged = (emotion: any) => {
  console.log('Emotion logged:', emotion)
}

const handlePhaseCompleted = (phase: 'before' | 'after') => {
  console.log('Phase completed:', phase)
  // Clear current phase after logging
  currentPhase.value = null
}

const handleBetPlaced = (bet: any) => {
  console.log('Bet placed:', bet)
}

const handleBetCanceled = (taskId: string) => {
  console.log('Bet canceled:', taskId)
}

const handleBetResolved = (taskId: string) => {
  console.log('Bet resolved:', taskId)
}

const handleNudgeScheduled = (nudge: any) => {
  console.log('Nudge scheduled:', nudge)
}

const handleNudgeCanceled = (taskId: string) => {
  console.log('Nudge canceled:', taskId)
}

const handleNudgeTriggered = (taskId: string) => {
  console.log('Nudge triggered:', taskId)
}

// Watch for errors from stores
watch([
  () => tasksStore.error,
  () => emotionsStore.error,
  () => betsStore.error,
  () => nudgesStore.error
], ([taskError, emotionError, betError, nudgeError]) => {
  const error = taskError || emotionError || betError || nudgeError
  if (error) {
    globalError.value = error
  }
})

// Lifecycle
onMounted(async () => {
  await refreshAll()
})
</script>

<style scoped>
.focus-flow-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.dashboard-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
}

.dashboard-controls {
  display: flex;
  gap: 1rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-controls {
  display: flex;
  gap: 0.75rem;
}

.section-content {
  padding: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
}

.modal-content {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.task-selection-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-selection-item {
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.task-selection-item:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.task-selection-item.selected {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.task-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.task-info p {
  margin: 0 0 0.75rem 0;
  color: #666;
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.task-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
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

.task-due {
  font-size: 0.85rem;
  color: #666;
}

.global-error {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2000;
  max-width: 400px;
}

.error-content {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-message {
  flex: 1;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #721c24;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-close:hover {
  background-color: rgba(114, 28, 36, 0.1);
}

.spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .dashboard-controls {
    justify-content: center;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .section-controls {
    justify-content: center;
  }
  
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .global-error {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
}
</style>
