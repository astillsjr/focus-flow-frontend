<template>
  <div class="bet-list">
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
  } catch (err) {
  } finally {
    isResolving.value = false
  }
}

// Initialize bets on component mount
onMounted(async () => {
  await refreshBets()
})

// Expose refresh method so parent components can trigger refresh
defineExpose({})
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
  padding: 1rem;
}

.bet-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #4D4D4D;
  padding-bottom: 0.5rem;
}

.bet-list-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.error-state p {
  color: #CF6679;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #B3B3B3;
  line-height: 1.6;
}

.bet-group {
  margin-bottom: 1.5rem;
}

.bet-group h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #FFFFFF;
}

.bet-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
</style>
