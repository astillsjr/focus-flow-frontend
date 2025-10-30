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
          <h1>Add accountability with a bet?</h1>

          <BaseCard padding="lg" class="bet-prompt-card">
            <div class="task-summary">
              <div class="task-summary__label">Task created</div>
              <div class="task-summary__title">{{ createdTaskTitle }}</div>
            </div>

            <p class="lead">
              Place a small wager to stay focused and earn points when you start a task early.
            </p>

            <ul class="benefits-list">
              <li>Earn points for earlier starts</li>
              <li>Set a clear deadline to get ahead</li>
              <li>Build momentum with streaks</li>
            </ul>

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
                Yes, place a bet
              </BaseButton>
              <BaseButton @click="skipBetting" variant="ghost">
                Skip
              </BaseButton>
            </div>
            <div class="footnote">
              If you skip, you won’t be able to place a bet for this task later.
            </div>
          </BaseCard>
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
          <h1>Task Created</h1>

          <BaseCard padding="lg" class="completion-card">
            <div class="status-row">
              <div class="status-badge" :class="betPlaced ? 'status-badge--success' : 'status-badge--neutral'">
                {{ betPlaced ? 'Bet Active' : 'No Bet Placed' }}
              </div>
            </div>

            <div class="task-title">{{ createdTaskTitle }}</div>

            <p class="completion-lead" v-if="betPlaced">
              Great! Your bet is live. Stay on track and earn points by finishing on time.
            </p>
            <p class="completion-lead" v-else>
              Your task is ready. You can manage it from your dashboard.
            </p>

            <div class="button-group">
              <BaseButton @click="goToDashboard" variant="primary">
                View Dashboard
              </BaseButton>
              <BaseButton @click="resetFlow" variant="ghost">
                Create Another Task
              </BaseButton>
            </div>
          </BaseCard>
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
import { BaseButton, BaseCard } from '../base'

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
  } catch (error) {
    betInitError.value = error instanceof Error ? error.message : 'Failed to initialize betting profile'
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
  betPlaced.value = true
  currentStep.value = 'complete'
}

/**
 * Handle bet error
 */
function handleBetError(error: Error) {
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
  router.push('/tasks')
}

// Initialize on mount
onMounted(() => {
  // Ensure bet store is initialized
  if (!betStore.isInitialized && betStore.hasProfile === false) {
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
  background-color: #3d2a1a;
  border: 1px solid #FFB74D;
  border-radius: 4px;
}

.warning-message p {
  margin: 0 0 0.5rem 0;
}

.error-message {
  padding: 1rem;
  margin: 1rem 0;
  background-color: #3d1a1a;
  border: 1px solid #CF6679;
  border-radius: 8px;
  color: #CF6679;
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

/* New styles for enriched bet prompt */
.bet-prompt-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lead {
  color: #cfcfcf;
  margin-top: 0.25rem;
}

.task-summary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 1px solid #2f2f2f;
  border-radius: 8px;
  background: #121212;
}

.task-summary__label {
  font-size: 0.8rem;
  color: #9aa3ab;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.task-summary__title {
  font-weight: 600;
  color: #ffffff;
}

.benefits-list {
  margin: 0.25rem 0 0 1rem;
  padding: 0;
  list-style: disc;
  color: #d7d7d7;
}

.footnote {
  font-size: 0.85rem;
  color: #98a2ab;
}

/* Completion step styles */
.completion-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-row {
  display: flex;
  justify-content: flex-start;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
  border: 1px solid #2f2f2f;
}

.status-badge--success {
  background: #0f2a16;
  color: #6ee7b7;
  border-color: #14532d;
}

.status-badge--neutral {
  background: #1f2937;
  color: #cbd5e1;
  border-color: #334155;
}

.task-title {
  font-weight: 600;
  color: #ffffff;
}

.completion-lead {
  color: #cfcfcf;
}
</style>

