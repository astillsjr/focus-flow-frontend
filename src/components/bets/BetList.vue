<template>
  <div class="bet-list" :style="cssVars">
    <div class="bet-list-header">
      <h2>Active Bets</h2>
    </div>

    <div v-if="isLoading && !bets.length" class="loading-state">
      <p>Loading bets...</p>
    </div>

    <BaseCard v-else-if="error" padding="lg" class="error-state">
      <p>{{ error }}</p>
      <BaseButton @click="refreshBets" variant="danger">
        Try Again
      </BaseButton>
    </BaseCard>

    <BaseCard v-else-if="!bets.length" padding="lg" class="empty-state">
      <p>No active bets yet. Place your first bet on a task to get started!</p>
    </BaseCard>

    <div v-else>
      <div v-if="pendingBets.length > 0" class="bet-group">
        <h3>Pending ({{ pendingBets.length }})</h3>
        <TransitionGroup name="bet-list" tag="div" class="bet-items">
          <BetItem
            v-for="bet in pendingBets"
            :key="bet._id"
            :bet="bet"
          />
        </TransitionGroup>
      </div>

      <div v-if="expiredBets.length > 0" class="bet-group">
        <h3>Expired - Needs Resolution ({{ expiredBets.length }})</h3>
        <TransitionGroup name="bet-list" tag="div" class="bet-items">
          <BetItem
            v-for="bet in expiredBets"
            :key="bet._id"
            :bet="bet"
          />
        </TransitionGroup>
        <BaseButton 
          @click="resolveExpiredBets" 
          :loading="isResolving"
          variant="primary"
          full-width
        >
          Resolve All Expired Bets
        </BaseButton>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBetStore } from '../../stores/betStore'
import { BaseButton, BaseCard } from '../base'
import BetItem from './BetItem.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

// Get bet store
const betStore = useBetStore()

// Local state for tracking operations
const isRefreshing = ref(false)
const isResolving = ref(false)

// Computed properties from store
const bets = computed(() => betStore.bets)
const pendingBets = computed(() => betStore.pendingBets)
const expiredBets = computed(() => betStore.expiredBets)
const resolvedBets = computed(() => betStore.resolvedBets)
const isLoading = computed(() => betStore.isLoading || isRefreshing.value)
const error = computed(() => betStore.error)

/**
 * Fetch/refresh bets from the API
 */
async function refreshBets() {
  try {
    isRefreshing.value = true
    await betStore.refreshActiveBets()  // Refreshes both bets and profile
  } finally {
    isRefreshing.value = false
  }
}

/**
 * Resolve all expired bets (now just refreshes from backend)
 */
async function resolveExpiredBets() {
  try {
    isResolving.value = true
    await betStore.refreshActiveBets()  // Just refresh, backend handles resolution
  } finally {
    isResolving.value = false
  }
}

// Initialize bets on component mount
onMounted(async () => {
  await refreshBets()
})
</script>

<style scoped>
/* Bet List Transitions */
.bet-list-enter-active,
.bet-list-leave-active {
  transition: all 0.4s ease;
}

.bet-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.bet-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.bet-list-move {
  transition: transform 0.4s ease;
}

.bet-list {
  padding: var(--spacing-md);
}

.bet-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.bet-list-header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
}

.error-state p {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.bet-group {
  margin-bottom: var(--spacing-lg);
}

.bet-group h3 {
  margin: 0 0 0.75rem 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.bet-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: 0.75rem;
}
</style>
