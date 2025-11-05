<template>
  <div class="bet-history" :style="cssVars">
    <!-- History Header -->
    <div class="history-header">
      <h2>Bet History</h2>
      <div class="history-controls">
        <span class="total-count">{{ totalResolvedBets }} resolved bet(s)</span>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>Filter by outcome:</label>
        <select v-model="selectedFilter" class="filter-select">
          <option value="all">All Bets</option>
          <option value="won">Won Bets</option>
          <option value="lost">Lost Bets</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !resolvedBets.length" class="loading-state">
      <p>Loading bet history...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <BaseButton @click="refreshBets" variant="danger">
        Try Again
      </BaseButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredBets.length" class="empty-message">
      <p v-if="selectedFilter === 'all'">No resolved bets yet.</p>
      <p v-else-if="selectedFilter === 'won'">No won bets yet.</p>
      <p v-else>No lost bets yet.</p>
    </div>

    <!-- Bet History List -->
    <div v-else>
      <div class="bet-group">
        <TransitionGroup name="bet-list" tag="div" class="bet-items">
          <BetItem
            v-for="bet in paginatedBets"
            :key="bet._id"
            :bet="bet"
          />
        </TransitionGroup>
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination">
        <BaseButton 
          @click="previousPage"
          :disabled="currentPage === 1"
          variant="ghost"
          size="sm"
        >
          Previous
        </BaseButton>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <BaseButton 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          variant="ghost"
          size="sm"
        >
          Next
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBetStore } from '../../stores/betStore'
import { BaseButton } from '../base'
import BetItem from './BetItem.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

// Get bet store
const betStore = useBetStore()

// Local state
const currentPage = ref(1)
const itemsPerPage = 10
const selectedFilter = ref<'all' | 'won' | 'lost'>('all')
const isRefreshing = ref(false)

// Computed properties from store
const resolvedBets = computed(() => betStore.resolvedBets)
const successfulBets = computed(() => betStore.successfulBets)
const failedBets = computed(() => betStore.failedBets)
const isLoading = computed(() => betStore.isLoading || isRefreshing.value)
const error = computed(() => betStore.error)

// Filtered bets based on selected filter
const filteredBets = computed(() => {
  switch (selectedFilter.value) {
    case 'won':
      return successfulBets.value
    case 'lost':
      return failedBets.value
    default:
      return resolvedBets.value
  }
})

// Total count for display
const totalResolvedBets = computed(() => resolvedBets.value.length)

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filteredBets.value.length / itemsPerPage))
const paginatedBets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBets.value.slice(start, end)
})

/**
 * Refresh bets from the API
 */
async function refreshBets() {
  try {
    isRefreshing.value = true
    await betStore.fetchAllBets()
  } finally {
    isRefreshing.value = false
  }
}

/**
 * Go to previous page
 */
function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

/**
 * Go to next page
 */
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Watch for filter changes and reset to first page
watch(selectedFilter, () => {
  currentPage.value = 1
})

// Initialize bets on component mount
onMounted(async () => {
  await refreshBets()
})
</script>

<style scoped>
.bet-list-enter-active,
.bet-list-leave-active {
  transition: all 0.3s ease;
}

.bet-list-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.bet-list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.bet-list-move {
  transition: transform 0.3s ease;
}
.bet-history {
  padding: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.history-header h2 {
  margin: 0;
  font-size: var(--font-size-xxl);
  color: var(--color-text);
}

.history-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.total-count {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.filter-controls {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
}

.filter-select {
  padding: var(--spacing-sm);
  background-color: var(--color-surface-container-high);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.9rem;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-in-progress);
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--spacing-xxxl) var(--spacing-md);
}

.loading-state p {
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-error);
}

.error-state p {
  font-size: 1.1rem;
  margin: 0;
}

.empty-message {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
  font-style: italic;
}

.bet-group {
  background-color: var(--color-surface-variant);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.bet-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.page-info {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
}

/* Responsive Design */
@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .history-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
