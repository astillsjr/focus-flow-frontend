<template>
  <BaseCard padding="md" class="bet-item" :style="cssVars">
    <div class="bet-info">
      <div class="bet-row">
        <strong>Wager:</strong> {{ bet.wager }} pts
        <span v-if="isResolved" :class="['status', bet.success ? 'won' : 'lost']">
          {{ bet.success ? 'Won' : 'Lost' }}
        </span>
        <span v-else-if="isExpired" class="status expired">Expired</span>
        <span v-else class="status active">Active</span>
      </div>
      
      <div class="bet-row">
        <strong>Deadline:</strong> {{ formattedDeadline }}
        <span v-if="timeRemaining" class="time-remaining">{{ timeRemaining }}</span>
      </div>
      
      <div v-if="bet.taskDueDate" class="bet-row">
        <strong>Task Due:</strong> {{ formattedTaskDueDate }}
      </div>
      
      <div class="bet-row">
        <strong>Task ID:</strong> {{ bet.task }}
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Bet } from '../../stores/betStore'
import { BaseCard } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

const props = defineProps<{ bet: Bet }>()

const isResolved = computed(() => props.bet.success !== undefined)
const isExpired = computed(() => {
  if (isResolved.value) return false
  return new Date(props.bet.deadline) < new Date()
})

const formattedDeadline = computed(() => {
  return new Date(props.bet.deadline).toLocaleString()
})

const formattedTaskDueDate = computed(() => {
  if (!props.bet.taskDueDate) return ''
  return new Date(props.bet.taskDueDate).toLocaleString()
})

const timeRemaining = computed(() => {
  if (isResolved.value) return null
  
  const now = new Date()
  const deadline = new Date(props.bet.deadline)
  const diff = deadline.getTime() - now.getTime()
  
  if (diff < 0) return null
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours < 24) return `(${hours}h ${minutes}m left)`
  const days = Math.floor(hours / 24)
  return `(${days}d left)`
})
</script>

<style scoped>
.bet-item {
  margin-bottom: var(--spacing-sm);
}

.bet-row {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.status {
  margin-left: var(--spacing-md);
  font-size: 0.85rem;
  font-weight: var(--font-weight-medium);
  padding: 0.125rem var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.status.active {
  color: var(--color-in-progress);
  background-color: rgba(66, 165, 245, 0.1);
}

.status.expired {
  color: var(--color-pending);
  background-color: rgba(255, 183, 77, 0.1);
}

.status.won {
  color: var(--color-completed);
  background-color: rgba(102, 187, 106, 0.1);
}

.status.lost {
  color: var(--color-error);
  background-color: rgba(207, 102, 121, 0.1);
}

.time-remaining {
  margin-left: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}
</style>