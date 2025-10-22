<template>
  <div class="nudge-scheduler">
    <div class="scheduler-header">
      <h3>Nudge Scheduler</h3>
      <div class="scheduler-controls">
        <button @click="refreshNudges" class="btn btn-secondary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-small"></span>
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="!selectedTask" class="no-task-selected">
      <div class="no-task-icon">⏰</div>
      <p>Select a task to schedule nudges</p>
    </div>

    <div v-else class="scheduler-content">
      <div class="task-context">
        <h4>{{ selectedTask.title }}</h4>
        <p class="task-description">{{ selectedTask.description || 'No description' }}</p>
        <div class="task-status">
          <span class="status-badge" :class="getTaskStatusClass(selectedTask)">
            {{ getTaskStatusText(selectedTask) }}
          </span>
        </div>
      </div>

      <!-- Existing Nudge Display -->
      <div v-if="existingNudge" class="existing-nudge">
        <div class="nudge-info">
          <h4>Current Nudge</h4>
          <div class="nudge-details">
            <div class="nudge-delivery">
              <span class="delivery-label">Delivery Time:</span>
              <span class="delivery-value">{{ formatDate(existingNudge.deliveryTime) }}</span>
            </div>
            <div class="nudge-status">
              <span class="status-label">Status:</span>
              <span class="status-value" :class="getNudgeStatusClass(existingNudge)">
                {{ getNudgeStatusText(existingNudge) }}
              </span>
            </div>
          </div>
          <div class="nudge-actions">
            <button
              v-if="canCancelNudge(existingNudge)"
              @click="cancelNudge"
              class="btn btn-danger"
              :disabled="isLoading"
            >
              Cancel Nudge
            </button>
            <button
              v-if="canTriggerNudge(existingNudge)"
              @click="triggerNudge"
              class="btn btn-primary"
              :disabled="isLoading"
            >
              Trigger Now
            </button>
          </div>
        </div>
      </div>

      <!-- New Nudge Form -->
      <div v-else-if="!selectedTask.completedAt" class="new-nudge-form">
        <h4>Schedule a Nudge</h4>
        <p class="nudge-description">
          Set up a motivational reminder to help you stay on track with this task.
        </p>
        
        <form @submit.prevent="scheduleNudge" class="nudge-form">
          <div class="form-group">
            <label for="deliveryTime" class="form-label">
              Delivery Time <span class="required">*</span>
            </label>
            <input
              id="deliveryTime"
              v-model="nudgeData.deliveryTime"
              type="datetime-local"
              required
              :disabled="isLoading"
              :min="minDateTime"
              class="form-input"
            />
            <div class="input-help">
              When should you receive this nudge?
            </div>
          </div>

          <div class="quick-schedule">
            <h5>Quick Schedule</h5>
            <div class="quick-options">
              <button
                type="button"
                @click="setQuickTime(1, 'hour')"
                class="btn btn-sm btn-outline"
                :disabled="isLoading"
              >
                In 1 Hour
              </button>
              <button
                type="button"
                @click="setQuickTime(2, 'hour')"
                class="btn btn-sm btn-outline"
                :disabled="isLoading"
              >
                In 2 Hours
              </button>
              <button
                type="button"
                @click="setQuickTime(1, 'day')"
                class="btn btn-sm btn-outline"
                :disabled="isLoading"
              >
                Tomorrow
              </button>
              <button
                type="button"
                @click="setQuickTime(1, 'week')"
                class="btn btn-sm btn-outline"
                :disabled="isLoading"
              >
                Next Week
              </button>
            </div>
          </div>

          <div class="nudge-summary">
            <h5>Nudge Summary</h5>
            <div class="summary-item">
              <span class="summary-label">Task:</span>
              <span class="summary-value">{{ selectedTask.title }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Delivery Time:</span>
              <span class="summary-value">{{ formatDate(nudgeData.deliveryTime) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Time Until Delivery:</span>
              <span class="summary-value">{{ getTimeUntilDelivery(nudgeData.deliveryTime) }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading || !isNudgeValid"
            >
              <span v-if="isLoading" class="spinner-small"></span>
              {{ isLoading ? 'Scheduling...' : 'Schedule Nudge' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Cannot Schedule Message -->
      <div v-else class="cannot-schedule">
        <div class="cannot-schedule-icon">✅</div>
        <h4>Task Already Completed</h4>
        <p>This task has already been completed, so no nudges are needed.</p>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNudgesStore } from '@/stores/nudges'
import type { TaskDoc, NudgeDoc } from '@/types/api'

const props = defineProps<{
  selectedTask: TaskDoc | null
}>()

const emit = defineEmits<{
  'nudge-scheduled': [nudge: NudgeDoc]
  'nudge-canceled': [taskId: string]
  'nudge-triggered': [taskId: string]
}>()

const nudgesStore = useNudgesStore()

// Local state
const nudgeData = ref({
  deliveryTime: ''
})

// Computed properties
const existingNudge = computed(() => {
  if (!props.selectedTask) return null
  return nudgesStore.getNudgeByTask(props.selectedTask._id)
})
const isLoading = computed(() => nudgesStore.isLoading)
const error = computed(() => nudgesStore.error)

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const isNudgeValid = computed(() => {
  return nudgeData.value.deliveryTime && 
         new Date(nudgeData.value.deliveryTime) > new Date()
})

// Methods
const formatDate = (date: Date | string) => {
  if (!date) return ''
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

const getNudgeStatusClass = (nudge: NudgeDoc) => {
  if (nudge.triggered) return 'status-triggered'
  if (nudge.canceled) return 'status-canceled'
  if (new Date(nudge.deliveryTime) <= new Date()) return 'status-ready'
  return 'status-scheduled'
}

const getNudgeStatusText = (nudge: NudgeDoc) => {
  if (nudge.triggered) return 'Triggered'
  if (nudge.canceled) return 'Canceled'
  if (new Date(nudge.deliveryTime) <= new Date()) return 'Ready'
  return 'Scheduled'
}

const canCancelNudge = (nudge: NudgeDoc) => {
  return !nudge.triggered && !nudge.canceled
}

const canTriggerNudge = (nudge: NudgeDoc) => {
  return !nudge.triggered && !nudge.canceled && new Date(nudge.deliveryTime) <= new Date()
}

const getTimeUntilDelivery = (deliveryTime: string) => {
  if (!deliveryTime) return ''
  
  const now = new Date()
  const delivery = new Date(deliveryTime)
  const diff = delivery.getTime() - now.getTime()
  
  if (diff <= 0) return 'Ready to deliver'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const setQuickTime = (amount: number, unit: 'hour' | 'day' | 'week') => {
  const now = new Date()
  let deliveryTime: Date
  
  switch (unit) {
    case 'hour':
      deliveryTime = new Date(now.getTime() + (amount * 60 * 60 * 1000))
      break
    case 'day':
      deliveryTime = new Date(now.getTime() + (amount * 24 * 60 * 60 * 1000))
      break
    case 'week':
      deliveryTime = new Date(now.getTime() + (amount * 7 * 24 * 60 * 60 * 1000))
      break
  }
  
  nudgeData.value.deliveryTime = deliveryTime.toISOString().slice(0, 16)
}

const scheduleNudge = async () => {
  if (!props.selectedTask || !isNudgeValid.value) return

  const success = await nudgesStore.scheduleNudge(
    props.selectedTask._id,
    new Date(nudgeData.value.deliveryTime)
  )

  if (success) {
    // Reset form
    nudgeData.value = {
      deliveryTime: ''
    }
    
    // Find the newly created nudge
    const newNudge = nudgesStore.nudges.find(nudge => nudge.task === props.selectedTask!._id)
    if (newNudge) {
      emit('nudge-scheduled', newNudge)
    }
  }
}

const cancelNudge = async () => {
  if (!props.selectedTask || !existingNudge.value) return

  const success = await nudgesStore.cancelNudge(props.selectedTask._id)
  if (success) {
    emit('nudge-canceled', props.selectedTask._id)
  }
}

const triggerNudge = async () => {
  if (!props.selectedTask || !existingNudge.value) return

  // This would typically involve calling the nudgeUser API
  // For now, we'll just mark it as triggered
  const result = await nudgesStore.nudgeUser(
    props.selectedTask._id,
    `Reminder: ${props.selectedTask.title}`,
    'Time to work on this task!',
    [] // No recent emotions for now
  )
  
  if (result) {
    emit('nudge-triggered', props.selectedTask._id)
  }
}

const refreshNudges = async () => {
  // This would typically fetch nudges from the store
  // For now, we'll just log it
  console.log('Refreshing nudges...')
}

// Watch for task changes
watch(() => props.selectedTask, () => {
  // Reset form when task changes
  nudgeData.value = {
    deliveryTime: ''
  }
})
</script>

<style scoped>
.nudge-scheduler {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

.scheduler-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.scheduler-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.scheduler-controls {
  display: flex;
  gap: 0.75rem;
}

.no-task-selected {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-task-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.scheduler-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-context {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.task-context h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.task-description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.existing-nudge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
}

.nudge-info h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.nudge-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.nudge-delivery, .nudge-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delivery-label, .status-label {
  font-weight: 500;
  opacity: 0.9;
}

.delivery-value, .status-value {
  font-weight: bold;
}

.status-value {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-value.status-scheduled {
  background-color: rgba(255, 255, 255, 0.2);
}

.status-value.status-ready {
  background-color: rgba(255, 193, 7, 0.8);
}

.status-value.status-triggered {
  background-color: rgba(40, 167, 69, 0.8);
}

.status-value.status-canceled {
  background-color: rgba(220, 53, 69, 0.8);
}

.nudge-actions {
  display: flex;
  gap: 0.75rem;
}

.new-nudge-form h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.nudge-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.nudge-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.input-help {
  font-size: 0.85rem;
  color: #666;
}

.quick-schedule {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.quick-schedule h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.quick-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-outline {
  background: white;
  border: 2px solid #007bff;
  color: #007bff;
}

.btn-outline:hover {
  background-color: #007bff;
  color: white;
}

.nudge-summary {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.nudge-summary h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: #666;
}

.summary-value {
  font-weight: 500;
  color: #2c3e50;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.cannot-schedule {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.cannot-schedule-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.cannot-schedule h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.cannot-schedule p {
  margin: 0;
  line-height: 1.5;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
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
  .scheduler-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .scheduler-controls {
    justify-content: center;
  }
  
  .nudge-delivery, .nudge-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .quick-options {
    justify-content: center;
  }
  
  .form-actions {
    justify-content: center;
  }
}
</style>
