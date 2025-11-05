<template>
  <DashboardLayout>
    <div class="flow-container" :style="cssVars">
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
            :task-due-date="createdTaskDueDate"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBetStore } from '../../stores/betStore'
import { useTaskStore } from '../../stores/taskStore'
import DashboardLayout from '../layout/DashboardLayout.vue'
import TaskForm from './TaskForm.vue'
import BetForm from '../bets/BetForm.vue'
import { BaseButton, BaseCard } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

type FlowStep = 'task' | 'bet-prompt' | 'bet-form' | 'complete'

const router = useRouter()
const betStore = useBetStore()
const taskStore = useTaskStore()

// Flow state
const currentStep = ref<FlowStep>('task')
const createdTaskId = ref<string | null>(null)
const createdTaskTitle = ref('')
const createdTaskDueDate = ref<Date | string | null>(null)
const betPlaced = ref(false)
const isInitializing = ref(false)
const betInitError = ref<string | null>(null)

/**
 * Handle task creation
 */
function handleTaskCreated(taskId: string) {
  createdTaskId.value = taskId
  
  // Get the task details from the store
  const task = taskStore.getTaskById(taskId)
  if (task) {
    createdTaskTitle.value = task.title
    createdTaskDueDate.value = task.dueDate || null
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
  createdTaskDueDate.value = null
  betPlaced.value = false
  betInitError.value = null
}

/**
 * Navigate to dashboard
 */
function goToDashboard() {
  router.push('/tasks')
}


</script>

<style scoped>
.flow-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 400px; /* Prevents jarring layout shifts between steps */
}

h1 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-xxl);
  color: var(--color-text);
}

p {
  margin: var(--spacing-sm) 0;
  color: var(--color-text);
}

/* Fade + Slide Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity var(--transition-slow), transform var(--transition-slow);
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
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  background-color: rgba(255, 183, 77, 0.1);
  border: 1px solid var(--color-pending);
  border-radius: var(--radius-sm);
}

.warning-message p {
  margin: 0 0 var(--spacing-sm) 0;
}

.error-message {
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  background-color: rgba(207, 102, 121, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
}

.button-group {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
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
}

/* New styles for enriched bet prompt */
.bet-prompt-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lead {
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.task-summary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
}

.task-summary__label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.task-summary__title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.benefits-list {
  margin: 0.25rem 0 0 1rem;
  padding: 0;
  list-style: disc;
  color: var(--color-text-secondary);
}

.footnote {
  font-size: 0.85rem;
  color: var(--color-text-muted);
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
  padding: 0.25rem var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
}

.status-badge--success {
  background: rgba(102, 187, 106, 0.1);
  color: var(--color-completed);
  border-color: var(--color-completed);
}

.status-badge--neutral {
  background: var(--color-surface-container-high);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.task-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.completion-lead {
  color: var(--color-text-secondary);
}
</style>

