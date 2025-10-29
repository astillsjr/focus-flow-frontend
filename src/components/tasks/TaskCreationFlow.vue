<template>
  <DashboardLayout>
    <div class="flow-container">
      <Transition name="fade-slide" mode="out-in">
        <!-- Step 1: Create Task -->
        <div v-if="currentStep === 'task'" key="task">
          <h1>Create New Task</h1>
          <TaskForm 
            @submit-task="handleTaskCreated"
            :show-title="false"
          />
        </div>

        <!-- Step 2: Bet Prompt -->
        <div v-else-if="currentStep === 'bet-prompt'" key="bet-prompt">
          <h1>Want to bet on this task?</h1>
          <p><strong>Task created:</strong> {{ createdTaskTitle }}</p>
          <p>Placing a bet increases accountability and can earn you points when you complete the task on time.</p>
          
          <div v-if="!betStore.hasProfile" class="warning-message">
            <p>You need to initialize your betting profile first.</p>
            <BaseButton @click="initializeBettor" :loading="isInitializing">
              Initialize Betting Profile
            </BaseButton>
          </div>

          <div v-if="betInitError" class="error-message">
            {{ betInitError }}
          </div>
          
          <div class="button-group">
            <BaseButton 
              @click="showBetForm" 
              :disabled="!betStore.hasProfile"
              variant="primary"
            >
              Yes, Place a Bet
            </BaseButton>
            <BaseButton @click="skipBetting" variant="ghost">
              Skip for Now
            </BaseButton>
          </div>
        </div>

        <!-- Step 3: Bet Form -->
        <div v-else-if="currentStep === 'bet-form'" key="bet-form">
          <h1>Place Your Bet</h1>
          <p>Set your wager and deadline for "{{ createdTaskTitle }}"</p>
          <BetForm
            :task-id="createdTaskId!"
            :task-title="createdTaskTitle"
            @bet-placed="handleBetPlaced"
            @error="handleBetError"
          />
          <BaseButton @click="skipBetting" variant="ghost">
            Skip Betting
          </BaseButton>
        </div>

        <!-- Step 4: Completion -->
        <div v-else-if="currentStep === 'complete'" key="complete">
          <h1>Task Created!</h1>
          <p v-if="betPlaced">Your task has been created and your bet is active.</p>
          <p v-else>Your task has been created successfully.</p>
          <p><strong>{{ createdTaskTitle }}</strong></p>
          
          <div class="button-group">
            <BaseButton @click="goToDashboard" variant="primary">
              View Dashboard
            </BaseButton>
            <BaseButton @click="resetFlow" variant="ghost">
              Create Another Task
            </BaseButton>
          </div>
        </div>
      </Transition>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBetStore } from '../../stores/betStore'
import { useTaskStore } from '../../stores/taskStore'
import DashboardLayout from '../layout/DashboardLayout.vue'
import TaskForm from './TaskForm.vue'
import BetForm from '../bets/BetForm.vue'
import { BaseButton } from '../base'

type FlowStep = 'task' | 'bet-prompt' | 'bet-form' | 'complete'

const router = useRouter()
const betStore = useBetStore()
const taskStore = useTaskStore()

// Flow state
const currentStep = ref<FlowStep>('task')
const createdTaskId = ref<string | null>(null)
const createdTaskTitle = ref('')
const betPlaced = ref(false)
const isInitializing = ref(false)
const betInitError = ref<string | null>(null)

/**
 * Handle task creation
 */
function handleTaskCreated(taskId: string) {
  createdTaskId.value = taskId
  
  // Get the task title from the store
  const task = taskStore.getTaskById(taskId)
  if (task) {
    createdTaskTitle.value = task.title
  }
  
  // Move to bet prompt
  currentStep.value = 'bet-prompt'
}

/**
 * Initialize betting profile
 */
async function initializeBettor() {
  isInitializing.value = true
  betInitError.value = null
  
  try {
    await betStore.initializeBettor()
    console.log('✅ Betting profile initialized')
  } catch (error) {
    betInitError.value = error instanceof Error ? error.message : 'Failed to initialize betting profile'
    console.error('❌ Failed to initialize bettor:', error)
  } finally {
    isInitializing.value = false
  }
}

/**
 * Show bet form
 */
function showBetForm() {
  if (!betStore.hasProfile) {
    betInitError.value = 'Please initialize your betting profile first'
    return
  }
  currentStep.value = 'bet-form'
}

/**
 * Skip betting and go to completion
 */
function skipBetting() {
  betPlaced.value = false
  currentStep.value = 'complete'
}

/**
 * Handle successful bet placement
 */
function handleBetPlaced(betId: string) {
  console.log('✅ Bet placed:', betId)
  betPlaced.value = true
  currentStep.value = 'complete'
}

/**
 * Handle bet error
 */
function handleBetError(error: Error) {
  console.error('❌ Bet error:', error)
  betInitError.value = `Failed to place bet: ${error.message}`
}

/**
 * Reset the flow to create another task
 */
function resetFlow() {
  currentStep.value = 'task'
  createdTaskId.value = null
  createdTaskTitle.value = ''
  betPlaced.value = false
  betInitError.value = null
}

/**
 * Navigate to dashboard
 */
function goToDashboard() {
  router.push('/dashboard')
}

// Initialize on mount
onMounted(() => {
  // Ensure bet store is initialized
  if (!betStore.isInitialized && betStore.hasProfile === false) {
    console.log('Bet store not initialized - will prompt user to initialize')
  }
})
</script>

<style scoped>
.flow-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 400px; /* Prevents jarring layout shifts between steps */
}

h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

p {
  margin: 0.5rem 0;
}

/* Fade + Slide Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.warning-message {
  padding: 1rem;
  margin: 1rem 0;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
}

.warning-message p {
  margin: 0 0 0.5rem 0;
}

.error-message {
  padding: 1rem;
  margin: 1rem 0;
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #d32f2f;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }
}

/* Remove fancy styling from child components */
:deep(.task-form) {
  padding: 0;
  max-width: none;
}

:deep(.bet-form) {
  padding: 1rem 0;
  border: none;
  background: transparent;
}

:deep(.bet-form h3) {
  display: none;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }
  
  button {
    width: 100%;
  }
}
</style>

