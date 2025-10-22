<template>
  <div class="nudge-display">
    <div class="nudge-header">
      <h3>Nudge Center</h3>
      <div class="nudge-controls">
        <button @click="refreshNudges" class="btn btn-secondary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-small"></span>
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading && nudges.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Loading nudges...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="refreshNudges" class="btn btn-secondary">Retry</button>
    </div>

    <div v-else-if="nudges.length === 0" class="empty-state">
      <div class="empty-icon">⏰</div>
      <h3>No nudges scheduled</h3>
      <p>Schedule nudges for your tasks to receive motivational reminders.</p>
    </div>

    <div v-else class="nudges-content">
      <!-- Nudge Statistics -->
      <div class="nudge-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalNudges }}</div>
          <div class="stat-label">Total Nudges</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ scheduledNudges.length }}</div>
          <div class="stat-label">Scheduled</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ triggeredNudges.length }}</div>
          <div class="stat-label">Triggered</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ readyNudges.length }}</div>
          <div class="stat-label">Ready</div>
        </div>
      </div>

      <!-- Ready Nudges (Priority) -->
      <div v-if="readyNudges.length > 0" class="ready-nudges">
        <h4>Ready to Deliver</h4>
        <div class="nudges-list">
          <div
            v-for="nudge in readyNudges"
            :key="nudge._id"
            class="nudge-item nudge-ready"
          >
            <div class="nudge-content">
              <div class="nudge-icon">🔔</div>
              <div class="nudge-info">
                <h5>{{ getTaskTitle(nudge.task) }}</h5>
                <p class="nudge-message">This nudge is ready to be delivered!</p>
                <div class="nudge-time">
                  <span class="time-label">Scheduled for:</span>
                  <span class="time-value">{{ formatDate(nudge.deliveryTime) }}</span>
                </div>
              </div>
            </div>
            <div class="nudge-actions">
              <button
                @click="triggerNudge(nudge)"
                class="btn btn-primary"
                :disabled="isLoading"
              >
                Deliver Now
              </button>
              <button
                @click="cancelNudge(nudge)"
                class="btn btn-danger"
                :disabled="isLoading"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Nudges -->
      <div v-if="upcomingNudges.length > 0" class="upcoming-nudges">
        <h4>Upcoming Nudges</h4>
        <div class="nudges-list">
          <div
            v-for="nudge in upcomingNudges"
            :key="nudge._id"
            class="nudge-item nudge-upcoming"
          >
            <div class="nudge-content">
              <div class="nudge-icon">⏰</div>
              <div class="nudge-info">
                <h5>{{ getTaskTitle(nudge.task) }}</h5>
                <p class="nudge-message">Scheduled for delivery</p>
                <div class="nudge-time">
                  <span class="time-label">Delivery Time:</span>
                  <span class="time-value">{{ formatDate(nudge.deliveryTime) }}</span>
                </div>
                <div class="nudge-countdown">
                  <span class="countdown-label">Time Until Delivery:</span>
                  <span class="countdown-value">{{ getTimeUntilDelivery(nudge.deliveryTime) }}</span>
                </div>
              </div>
            </div>
            <div class="nudge-actions">
              <button
                @click="cancelNudge(nudge)"
                class="btn btn-danger"
                :disabled="isLoading"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Triggered Nudges -->
      <div v-if="triggeredNudges.length > 0" class="triggered-nudges">
        <h4>Recently Delivered</h4>
        <div class="nudges-list">
          <div
            v-for="nudge in triggeredNudges"
            :key="nudge._id"
            class="nudge-item nudge-triggered"
          >
            <div class="nudge-content">
              <div class="nudge-icon">✅</div>
              <div class="nudge-info">
                <h5>{{ getTaskTitle(nudge.task) }}</h5>
                <p class="nudge-message">This nudge has been delivered</p>
                <div class="nudge-time">
                  <span class="time-label">Delivered at:</span>
                  <span class="time-value">{{ formatDate(nudge.deliveryTime) }}</span>
                </div>
              </div>
            </div>
            <div class="nudge-status">
              <span class="status-badge status-delivered">Delivered</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Canceled Nudges -->
      <div v-if="canceledNudges.length > 0" class="canceled-nudges">
        <h4>Canceled Nudges</h4>
        <div class="nudges-list">
          <div
            v-for="nudge in canceledNudges"
            :key="nudge._id"
            class="nudge-item nudge-canceled"
          >
            <div class="nudge-content">
              <div class="nudge-icon">❌</div>
              <div class="nudge-info">
                <h5>{{ getTaskTitle(nudge.task) }}</h5>
                <p class="nudge-message">This nudge was canceled</p>
                <div class="nudge-time">
                  <span class="time-label">Was scheduled for:</span>
                  <span class="time-value">{{ formatDate(nudge.deliveryTime) }}</span>
                </div>
              </div>
            </div>
            <div class="nudge-status">
              <span class="status-badge status-canceled">Canceled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNudgesStore } from '@/stores/nudges'
import { useTasksStore } from '@/stores/tasks'
import type { NudgeDoc } from '@/types/api'

const nudgesStore = useNudgesStore()
const tasksStore = useTasksStore()

// Computed properties
const nudges = computed(() => nudgesStore.nudges)
const scheduledNudges = computed(() => nudgesStore.scheduledNudges)
const triggeredNudges = computed(() => nudgesStore.triggeredNudges)
const canceledNudges = computed(() => nudgesStore.canceledNudges)
const readyNudges = computed(() => nudgesStore.readyNudges)
const upcomingNudges = computed(() => nudgesStore.upcomingNudges)
const isLoading = computed(() => nudgesStore.isLoading)
const error = computed(() => nudgesStore.error)

const totalNudges = computed(() => nudges.value.length)

// Methods
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

const getTaskTitle = (taskId: string) => {
  const task = tasksStore.getTaskById(taskId)
  return task ? task.title : `Task ${taskId.slice(0, 8)}...`
}

const getTimeUntilDelivery = (deliveryTime: string) => {
  const now = new Date()
  const delivery = new Date(deliveryTime)
  const diff = delivery.getTime() - now.getTime()
  
  if (diff <= 0) return 'Ready'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const refreshNudges = async () => {
  // This would typically fetch nudges from the store
  console.log('Refreshing nudges...')
}

const triggerNudge = async (nudge: NudgeDoc) => {
  const result = await nudgesStore.nudgeUser(
    nudge.task,
    `Reminder: ${getTaskTitle(nudge.task)}`,
    'Time to work on this task!',
    [] // No recent emotions for now
  )
  
  if (result) {
    console.log('Nudge triggered:', result.message)
  }
}

const cancelNudge = async (nudge: NudgeDoc) => {
  const success = await nudgesStore.cancelNudge(nudge.task)
  if (success) {
    console.log('Nudge canceled')
  }
}

// Lifecycle
onMounted(async () => {
  await refreshNudges()
})
</script>

<style scoped>
.nudge-display {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 1000px;
  margin: 0 auto;
}

.nudge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 1rem;
}

.nudge-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.nudge-controls {
  display: flex;
  gap: 0.75rem;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.nudges-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.nudge-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ready-nudges h4, .upcoming-nudges h4, .triggered-nudges h4, .canceled-nudges h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.nudges-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nudge-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #ddd;
  transition: all 0.3s ease;
}

.nudge-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.nudge-item.nudge-ready {
  border-left-color: #ffc107;
  background-color: #fff8e1;
}

.nudge-item.nudge-upcoming {
  border-left-color: #007bff;
}

.nudge-item.nudge-triggered {
  border-left-color: #28a745;
  background-color: #f8fff8;
}

.nudge-item.nudge-canceled {
  border-left-color: #dc3545;
  background-color: #fff8f8;
  opacity: 0.8;
}

.nudge-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.nudge-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.nudge-info {
  flex: 1;
}

.nudge-info h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.nudge-message {
  margin: 0 0 0.75rem 0;
  color: #666;
  font-size: 0.9rem;
}

.nudge-time, .nudge-countdown {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.time-label, .countdown-label {
  font-weight: 500;
}

.time-value, .countdown-value {
  color: #2c3e50;
  font-weight: 500;
}

.nudge-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.nudge-status {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-delivered {
  background-color: #d4edda;
  color: #155724;
}

.status-canceled {
  background-color: #f8d7da;
  color: #721c24;
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

@media (max-width: 768px) {
  .nudge-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nudge-controls {
    justify-content: center;
  }
  
  .nudge-stats {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .nudge-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .nudge-actions {
    justify-content: center;
  }
  
  .nudge-time, .nudge-countdown {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
