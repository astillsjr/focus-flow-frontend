<template>
  <div class="bet-list">
    <div class="bet-list-header">
      <h2>Your Bets</h2>
      <button @click="refreshBets" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="isLoading && !bets.length">
      <p>Loading bets...</p>
    </div>

    <div v-else-if="error">
      <p>{{ error }}</p>
      <button @click="refreshBets">Try Again</button>
    </div>

    <div v-else-if="!bets.length">
      <p>No active bets yet. Place your first bet on a task to get started!</p>
    </div>

    <div v-else>
      <div v-if="pendingBets.length > 0" class="bet-group">
        <h3>Active Bets ({{ pendingBets.length }})</h3>
        <div class="bet-items">
          <BetItem
            v-for="bet in pendingBets"
            :key="bet._id"
            :bet="bet"
          />
        </div>
      </div>

      <div v-if="expiredBets.length > 0" class="bet-group">
        <h3>Expired - Needs Resolution ({{ expiredBets.length }})</h3>
        <div class="bet-items">
          <BetItem
            v-for="bet in expiredBets"
            :key="bet._id"
            :bet="bet"
          />
        </div>
        <button @click="resolveExpiredBets" :disabled="isResolving">
          {{ isResolving ? 'Resolving...' : 'Resolve All Expired Bets' }}
        </button>
      </div>

      <div v-if="resolvedBets.length > 0" class="bet-group">
        <h3>Recently Resolved ({{ resolvedBets.length }})</h3>
        <div class="bet-items">
          <BetItem
            v-for="bet in resolvedBets.slice(0, 10)"
            :key="bet._id"
            :bet="bet"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBetStore } from '../../stores/betStore'
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
    await betStore.fetchActiveBets()
    await betStore.checkAndResolveExpiredBets()
    console.log('✅ Bets refreshed successfully')
  } catch (err) {
    console.error('❌ Failed to refresh bets:', err)
  } finally {
    isRefreshing.value = false
  }
}

/**
 * Resolve all expired bets
 */
async function resolveExpiredBets() {
  try {
    isResolving.value = true
    await betStore.checkAndResolveExpiredBets()
    console.log('✅ Expired bets resolved successfully')
  } catch (err) {
    console.error('❌ Failed to resolve expired bets:', err)
  } finally {
    isResolving.value = false
  }
}

// Initialize bets on component mount
onMounted(async () => {
  await refreshBets()
})

// Expose refresh method so parent components can trigger refresh
defineExpose({
  refreshBets
})
</script>

<style scoped>
.bet-list {
  padding: 1rem;
}

.bet-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

.bet-list-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.bet-list-header button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.bet-group {
  margin-bottom: 1.5rem;
}

.bet-group h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.bet-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.bet-group button {
  padding: 0.5rem;
  cursor: pointer;
  width: 100%;
}
</style>
