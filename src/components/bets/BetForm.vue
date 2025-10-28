<template>
  <div class="bet-form">
    <h3>Place a Bet on This Task</h3>
    
    <div v-if="betStore.hasProfile" class="profile-info">
      <span class="points-display">
        Available Points: <strong>{{ betStore.points }}</strong>
      </span>
      <span v-if="betStore.streak > 0" class="streak-display">
        Streak: {{ betStore.streak }}
      </span>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="wager">
          Wager Amount <span class="required">*</span>
        </label>
        <input
          id="wager"
          v-model.number="wager"
          type="number"
          min="1"
          :max="betStore.points"
          placeholder="Enter points to wager"
          required
          :disabled="isLoading || !betStore.hasProfile"
        />
        <span class="help-text">
          Bet points on completing this task by the deadline
        </span>
      </div>

      <div class="form-group">
        <label for="deadline">
          Deadline <span class="required">*</span>
        </label>
        <input
          id="deadline"
          v-model="deadline"
          type="datetime-local"
          :min="minDeadline"
          required
          :disabled="isLoading || !betStore.hasProfile"
        />
        <span class="help-text">
          When will you complete this task?
        </span>
      </div>

      <div class="form-group">
        <label for="taskDueDate">
          Task Due Date (Optional)
        </label>
        <input
          id="taskDueDate"
          v-model="taskDueDate"
          type="datetime-local"
          :disabled="isLoading || !betStore.hasProfile"
        />
        <span class="help-text">
          Optional: Actual due date for the task
        </span>
      </div>

      <div v-if="!betStore.hasProfile" class="warning-message">
        ⚠️ You need to initialize your betting profile first
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="bet-summary" v-if="isFormValid">
        <h4>Bet Summary</h4>
        <div class="summary-item">
          <span>Wager:</span>
          <strong>{{ wager }} points</strong>
        </div>
        <div class="summary-item">
          <span>Potential Reward:</span>
          <strong>{{ potentialReward }} points</strong>
        </div>
        <div class="summary-item">
          <span>Deadline:</span>
          <strong>{{ formattedDeadline }}</strong>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="isLoading || !isFormValid || !betStore.hasProfile"
          class="submit-button"
        >
          {{ isLoading ? 'Placing Bet...' : 'Place Bet' }}
        </button>
        <button 
          type="button" 
          @click="clearForm" 
          :disabled="isLoading"
          class="clear-button"
        >
          Clear
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBetStore } from '../../stores/betStore'

// Props
const props = defineProps<{
  taskId: string
  taskTitle?: string
}>()

// Emits
const emit = defineEmits<{
  'bet-placed': [betId: string]
  'error': [error: Error]
}>()

// Store
const betStore = useBetStore()

// Form state
const wager = ref<number>(10)
const deadline = ref('')
const taskDueDate = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const minDeadline = computed(() => {
  const now = new Date()
  now.setHours(now.getHours() + 1) // Minimum 1 hour from now
  return now.toISOString().slice(0, 16)
})

const isFormValid = computed(() => {
  return (
    wager.value > 0 &&
    wager.value <= betStore.points &&
    deadline.value !== '' &&
    new Date(deadline.value) > new Date()
  )
})

const potentialReward = computed(() => {
  // Simple calculation: 2x the wager for successful completion
  return wager.value * 2
})

const formattedDeadline = computed(() => {
  if (!deadline.value) return ''
  return new Date(deadline.value).toLocaleString()
})

// Methods
function clearForm() {
  wager.value = 10
  deadline.value = ''
  taskDueDate.value = ''
  error.value = null
}

async function handleSubmit() {
  if (!isFormValid.value) {
    error.value = 'Please fill in all required fields correctly'
    return
  }

  if (!betStore.hasProfile) {
    error.value = 'Betting profile not initialized'
    return
  }

  // Validate wager amount
  if (wager.value > betStore.points) {
    error.value = `Insufficient points. You only have ${betStore.points} points available.`
    return
  }

  // Validate deadline is in the future
  if (new Date(deadline.value) <= new Date()) {
    error.value = 'Deadline must be in the future'
    return
  }

  error.value = null
  isLoading.value = true

  try {
    const betId = await betStore.placeBet({
      taskId: props.taskId,
      wager: wager.value,
      deadline: new Date(deadline.value).toISOString(),
      taskDueDate: taskDueDate.value ? new Date(taskDueDate.value).toISOString() : undefined
    })

    console.log('✅ Bet placed successfully!', { betId, wager: wager.value })

    // Emit success event
    emit('bet-placed', betId)

    // Clear form on success
    clearForm()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to place bet'
    error.value = errorMessage
    emit('error', err instanceof Error ? err : new Error(errorMessage))
    console.error('❌ Bet placement error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.bet-form {
  max-width: 500px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

h3 {
  margin-bottom: 1rem;
  color: #333;
}

.profile-info {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.points-display,
.streak-display {
  color: #1565c0;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #f44336;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #666;
}

.warning-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 0.9rem;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 0.9rem;
}

.bet-summary {
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 4px solid #2196F3;
}

.bet-summary h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.submit-button,
.clear-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button {
  background-color: #2196F3;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.clear-button {
  background-color: white;
  color: #333;
  border: 1px solid #ccc;
}

.clear-button:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>