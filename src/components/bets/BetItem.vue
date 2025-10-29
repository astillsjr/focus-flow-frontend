<template>
  <BaseCard padding="md" class="bet-item">
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
  margin-bottom: 0.5rem;
}

.bet-row {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.status {
  margin-left: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.status.active {
  color: #2196F3;
  background-color: #e3f2fd;
}

.status.expired {
  color: #ff9800;
  background-color: #fff3e0;
}

.status.won {
  color: #4CAF50;
  background-color: #e8f5e9;
}

.status.lost {
  color: #f44336;
  background-color: #ffebee;
}

.time-remaining {
  margin-left: 0.5rem;
  color: #666;
  font-size: 0.85rem;
}
</style>