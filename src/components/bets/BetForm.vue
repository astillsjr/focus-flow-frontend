<template>
  <BaseCard padding="lg" class="bet-form">
    <h3>Place a Bet on This Task</h3>
    
    <div v-if="betStore.hasProfile" class="profile-info">
      <span class="points-display">
        Available Points: <strong>{{ betStore.points }}</strong>
      </span>
      <span v-if="betStore.streak > 0" class="streak-display">
        Streak: {{ betStore.streak }}
      </span>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <BaseInput
        v-model="wager"
        label="Wager Amount"
        type="number"
        placeholder="Enter points to wager"
        required
        :disabled="isLoading || !betStore.hasProfile"
        hint="Bet points on completing this task by the deadline"
      />

      <BaseInput
        v-model="deadline"
        label="Deadline"
        type="datetime-local"
        required
        :disabled="isLoading || !betStore.hasProfile"
        :hint="deadlineHint"
      />

      <div v-if="!betStore.hasProfile" class="warning-message">
        You need to initialize your betting profile first
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <BaseCard v-if="isFormValid" padding="md" class="bet-summary">
        <h4>Bet Summary</h4>
        <div class="summary-item">
          <span>Wager:</span>
          <strong>{{ wager }} points</strong>
        </div>
        <div class="summary-item">
          <span>Deadline:</span>
          <strong>{{ formattedDeadline }}</strong>
        </div>
        <div v-if="props.taskDueDate" class="summary-item">
          <span>Task Due:</span>
          <strong>{{ formattedTaskDueDate }}</strong>
        </div>
      </BaseCard>

      <div class="form-actions">
        <BaseButton 
          type="submit" 
          :disabled="!isFormValid || !betStore.hasProfile"
          :loading="isLoading"
          full-width
        >
          Place Bet
        </BaseButton>
        <BaseButton 
          type="button" 
          @click="clearForm" 
          :disabled="isLoading"
          variant="ghost"
          full-width
        >
          Clear
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBetStore } from '../../stores/betStore'
import { BaseButton, BaseCard, BaseInput } from '../base'

// Props
const props = defineProps<{
  taskId: string
  taskTitle?: string
  taskDueDate?: Date | string
}>()

// Emits
const emit = defineEmits<{
  'bet-placed': [betId: string]
  'error': [error: Error]
}>()

// Store
const betStore = useBetStore()

// Form state
const wager = ref<string>('10')
const deadline = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  const wagerNum = Number(wager.value)
  if (!(wagerNum > 0 && wagerNum <= betStore.points && deadline.value !== '')) {
    return false
  }
  
  const deadlineDate = new Date(deadline.value)
  if (deadlineDate <= new Date()) {
    return false
  }
  
  // Check if deadline is after task due date (if task has one)
  if (props.taskDueDate) {
    const taskDueDate = new Date(props.taskDueDate)
    if (deadlineDate > taskDueDate) {
      return false
    }
  }
  
  return true
})

const deadlineHint = computed(() => {
  if (props.taskDueDate) {
    const taskDueDate = new Date(props.taskDueDate)
    const formattedDueDate = taskDueDate.toLocaleString()
    return `When will you start this task? (Task due: ${formattedDueDate})`
  }
  return 'When will you start this task?'
})

const formattedDeadline = computed(() => {
  if (!deadline.value) return ''
  return new Date(deadline.value).toLocaleString()
})

const formattedTaskDueDate = computed(() => {
  if (!props.taskDueDate) return ''
  return new Date(props.taskDueDate).toLocaleString()
})

// Methods
function clearForm() {
  wager.value = '10'
  deadline.value = ''
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

  const wagerNum = Number(wager.value)

  // Validate wager amount
  if (wagerNum > betStore.points) {
    error.value = `Insufficient points. You only have ${betStore.points} points available.`
    return
  }

  // Validate deadline is in the future
  const deadlineDate = new Date(deadline.value)
  if (deadlineDate <= new Date()) {
    error.value = 'Deadline must be in the future'
    return
  }

  // Validate deadline is not after task due date (if task has one)
  if (props.taskDueDate) {
    const taskDueDate = new Date(props.taskDueDate)
    if (deadlineDate > taskDueDate) {
      error.value = `Bet deadline cannot be after the task due date (${taskDueDate.toLocaleString()})`
      return
    }
  }

  error.value = null
  isLoading.value = true

  try {
    const betId = await betStore.placeBet({
      taskId: props.taskId,
      wager: wagerNum,
      deadline: deadlineDate.toISOString(),
      taskDueDate: props.taskDueDate ? new Date(props.taskDueDate).toISOString() : undefined
    })

    // Emit success event
    emit('bet-placed', betId)

    // Clear form on success
    clearForm()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to place bet'
    error.value = errorMessage
    emit('error', err instanceof Error ? err : new Error(errorMessage))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.bet-form {
  max-width: 500px;
}

h3 {
  margin-bottom: 1rem;
  color: #FFFFFF;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-info {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: #0d2540;
  border-radius: 8px;
  font-size: 0.9rem;
}

.points-display,
.streak-display {
  color: #42A5F5;
}

.warning-message {
  padding: 0.75rem;
  background-color: #3d2a1a;
  border: 1px solid #FFB74D;
  border-radius: 8px;
  color: #FFB74D;
  font-size: 0.9rem;
}

.error-message {
  padding: 0.75rem;
  background-color: #3d1a1a;
  border: 1px solid #CF6679;
  border-radius: 8px;
  color: #CF6679;
  font-size: 0.9rem;
}

.bet-summary {
  border-left: 4px solid #42A5F5;
}

.bet-summary h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #B3B3B3;
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
  margin-top: 0.5rem;
}
</style>