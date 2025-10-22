<template>
  <div class="betting-interface">
    <div class="betting-header">
      <h3>Micro Betting</h3>
      <div class="user-profile" v-if="userProfile">
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-value">{{ userProfile.points }}</span>
            <span class="stat-label">Points</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ userProfile.streak }}</span>
            <span class="stat-label">Streak</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!selectedTask" class="no-task-selected">
      <div class="no-task-icon">🎯</div>
      <p>Select a task to place a bet</p>
    </div>

    <div v-else class="betting-content">
      <div class="task-context">
        <h4>{{ selectedTask.title }}</h4>
        <p class="task-description">{{ selectedTask.description || 'No description' }}</p>
        <div class="task-status">
          <span class="status-badge" :class="getTaskStatusClass(selectedTask)">
            {{ getTaskStatusText(selectedTask) }}
          </span>
        </div>
      </div>

      <!-- Existing Bet Display -->
      <div v-if="existingBet" class="existing-bet">
        <div class="bet-info">
          <h4>Current Bet</h4>
          <div class="bet-details">
            <div class="bet-amount">
              <span class="amount-label">Wager:</span>
              <span class="amount-value">{{ existingBet.wager }} points</span>
            </div>
            <div class="bet-deadline">
              <span class="deadline-label">Deadline:</span>
              <span class="deadline-value">{{ formatDate(existingBet.deadline) }}</span>
            </div>
            <div class="bet-status">
              <span class="status-label">Status:</span>
              <span class="status-value" :class="getBetStatusClass(existingBet)">
                {{ getBetStatusText(existingBet) }}
              </span>
            </div>
          </div>
          <div class="bet-actions">
            <button
              v-if="canCancelBet(existingBet)"
              @click="cancelBet"
              class="btn btn-danger"
              :disabled="isLoading"
            >
              Cancel Bet
            </button>
            <button
              v-if="canResolveBet(existingBet)"
              @click="resolveBet"
              class="btn btn-success"
              :disabled="isLoading"
            >
              Resolve Bet
            </button>
          </div>
        </div>
      </div>

      <!-- New Bet Form -->
      <div v-else-if="!selectedTask.startedAt && !selectedTask.completedAt" class="new-bet-form">
        <h4>Place a Bet</h4>
        <p class="bet-description">
          Bet points on completing this task by a specific deadline. If you succeed, you'll earn double the points!
        </p>
        
        <form @submit.prevent="placeBet" class="bet-form">
          <div class="form-group">
            <label for="wager" class="form-label">
              Wager Amount <span class="required">*</span>
            </label>
            <div class="wager-input-group">
              <input
                id="wager"
                v-model.number="betData.wager"
                type="number"
                min="1"
                :max="userProfile?.points || 0"
                required
                :disabled="isLoading"
                class="form-input"
                placeholder="Enter wager amount"
              />
              <span class="input-suffix">points</span>
            </div>
            <div class="input-help">
              Available: {{ userProfile?.points || 0 }} points
            </div>
          </div>

          <div class="form-group">
            <label for="deadline" class="form-label">
              Deadline <span class="required">*</span>
            </label>
            <input
              id="deadline"
              v-model="betData.deadline"
              type="datetime-local"
              required
              :disabled="isLoading"
              :min="minDateTime"
              class="form-input"
            />
            <div class="input-help">
              When do you plan to complete this task?
            </div>
          </div>

          <div class="bet-summary">
            <h5>Bet Summary</h5>
            <div class="summary-item">
              <span class="summary-label">Wager:</span>
              <span class="summary-value">{{ betData.wager || 0 }} points</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Potential Reward:</span>
              <span class="summary-value">{{ (betData.wager || 0) * 2 }} points</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Deadline:</span>
              <span class="summary-value">{{ formatDate(betData.deadline) }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading || !isBetValid"
            >
              <span v-if="isLoading" class="spinner-small"></span>
              {{ isLoading ? 'Placing Bet...' : 'Place Bet' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Cannot Bet Message -->
      <div v-else class="cannot-bet">
        <div class="cannot-bet-icon">🚫</div>
        <h4>Cannot Place Bet</h4>
        <p v-if="selectedTask.startedAt">
          This task has already been started. You can only bet on tasks before they begin.
        </p>
        <p v-else-if="selectedTask.completedAt">
          This task has already been completed.
        </p>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBetsStore } from '@/stores/bets'
import type { TaskDoc, BetDoc } from '@/types/api'

const props = defineProps<{
  selectedTask: TaskDoc | null
}>()

const emit = defineEmits<{
  'bet-placed': [bet: BetDoc]
  'bet-canceled': [taskId: string]
  'bet-resolved': [taskId: string]
}>()

const betsStore = useBetsStore()

// Local state
const betData = ref({
  wager: 1,
  deadline: ''
})

// Computed properties
const userProfile = computed(() => betsStore.userProfile)
const existingBet = computed(() => {
  if (!props.selectedTask) return null
  return betsStore.getBetByTask(props.selectedTask._id)
})
const isLoading = computed(() => betsStore.isLoading)
const error = computed(() => betsStore.error)

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const isBetValid = computed(() => {
  return betData.value.wager > 0 && 
         betData.value.wager <= (userProfile.value?.points || 0) &&
         betData.value.deadline &&
         new Date(betData.value.deadline) > new Date()
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

const getBetStatusClass = (bet: BetDoc) => {
  if (bet.success === true) return 'status-success'
  if (bet.success === false) return 'status-failure'
  return 'status-pending'
}

const getBetStatusText = (bet: BetDoc) => {
  if (bet.success === true) return 'Success'
  if (bet.success === false) return 'Failed'
  return 'Pending'
}

const canCancelBet = (bet: BetDoc) => {
  return bet.success === undefined && new Date(bet.deadline) > new Date()
}

const canResolveBet = (bet: BetDoc) => {
  return bet.success === undefined && props.selectedTask?.completedAt
}

const placeBet = async () => {
  if (!props.selectedTask || !isBetValid.value) return

  const success = await betsStore.placeBet(
    props.selectedTask._id,
    betData.value.wager,
    new Date(betData.value.deadline)
  )

  if (success) {
    // Reset form
    betData.value = {
      wager: 1,
      deadline: ''
    }
    
    // Find the newly created bet
    const newBet = betsStore.bets.find(bet => bet.task === props.selectedTask!._id)
    if (newBet) {
      emit('bet-placed', newBet)
    }
  }
}

const cancelBet = async () => {
  if (!props.selectedTask || !existingBet.value) return

  const success = await betsStore.cancelBet(props.selectedTask._id)
  if (success) {
    emit('bet-canceled', props.selectedTask._id)
  }
}

const resolveBet = async () => {
  if (!props.selectedTask || !existingBet.value) return

  const success = await betsStore.resolveBet(props.selectedTask._id)
  if (success) {
    emit('bet-resolved', props.selectedTask._id)
  }
}

// Watch for task changes
watch(() => props.selectedTask, () => {
  // Reset form when task changes
  betData.value = {
    wager: 1,
    deadline: ''
  }
})
</script>

<style scoped>
.betting-interface {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

.betting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.betting-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.user-profile {
  display: flex;
  align-items: center;
}

.profile-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  text-align: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  min-width: 60px;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.betting-content {
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

.existing-bet {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
}

.bet-info h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.bet-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.bet-amount, .bet-deadline, .bet-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label, .deadline-label, .status-label {
  font-weight: 500;
  opacity: 0.9;
}

.amount-value, .deadline-value {
  font-weight: bold;
}

.status-value {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-value.status-pending {
  background-color: rgba(255, 255, 255, 0.2);
}

.status-value.status-success {
  background-color: rgba(40, 167, 69, 0.8);
}

.status-value.status-failure {
  background-color: rgba(220, 53, 69, 0.8);
}

.bet-actions {
  display: flex;
  gap: 0.75rem;
}

.new-bet-form h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.bet-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.bet-form {
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

.wager-input-group {
  display: flex;
  align-items: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.wager-input-group .form-input {
  border: none;
  border-radius: 0;
  flex: 1;
}

.input-suffix {
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  color: #666;
  font-weight: 500;
  border-left: 1px solid #ddd;
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

.bet-summary {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.bet-summary h5 {
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

.cannot-bet {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.cannot-bet-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.cannot-bet h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.cannot-bet p {
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
  .betting-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .bet-details {
    gap: 0.5rem;
  }
  
  .bet-amount, .bet-deadline, .bet-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .form-actions {
    justify-content: center;
  }
}
</style>
