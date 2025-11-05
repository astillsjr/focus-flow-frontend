<template>
  <DashboardLayout>
    <!-- Header with username -->
    <div class="dashboard-header" :style="cssVars">
      <h1>Your Bets</h1>
    </div>

    <!-- Initialize Profile Section -->
    <BaseCard v-if="!isInitialized && !isLoading" padding="lg">
      <p>Initialize your betting profile to get started.</p>
      <BaseButton @click="handleInitialize" :loading="isInitializing">
        Initialize Profile
      </BaseButton>
    </BaseCard>

    <!-- Loading State -->
    <div v-else-if="isLoading && !isInitialized">
      <p>Loading...</p>
    </div>

    <!-- Error State -->
    <BaseCard v-else-if="error" padding="lg">
      <p class="error-message">{{ error }}</p>
      <BaseButton @click="handleRefresh" variant="danger">
        Try Again
      </BaseButton>
    </BaseCard>

    <!-- Main Dashboard Content -->
    <div v-else-if="isInitialized">
      <!-- View Toggle Section -->
      <div class="view-toggle-section">
        <BaseButton 
          @click="toggleView"
          variant="ghost"
          size="lg"
        >
          {{ showHistory ? 'Show Active Bets' : 'Show Bet History' }}
        </BaseButton>
      </div>

      <Transition name="view-switch" mode="out-in">
        <!-- Active Bets View -->
        <div v-if="!showHistory" key="active">
          <BetStats />
          <BetList />
        </div>

        <!-- Bet History View -->
        <div v-else key="history">
          <BetHistory />
        </div>
      </Transition>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBetStore } from '../../stores/betStore'
import DashboardLayout from '../layout/DashboardLayout.vue'
import BetStats from './BetStats.vue'
import BetList from './BetList.vue'
import BetHistory from './BetHistory.vue'
import { BaseButton, BaseCard } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

// Get stores
const betStore = useBetStore()

// Local state
const isInitializing = ref(false)
const showHistory = ref(false)

// Computed properties from store
const isInitialized = computed(() => betStore.isInitialized)
const isLoading = computed(() => betStore.isLoading)
const error = computed(() => betStore.error)

/**
 * Toggle between active bets and history view
 */
function toggleView() {
  showHistory.value = !showHistory.value
}

/**
 * Initialize betting profile for the user
 */
async function handleInitialize() {
  try {
    isInitializing.value = true
    await betStore.initializeBettor()
  } finally {
    isInitializing.value = false
  }
}

/**
 * Refresh betting data
 */
async function handleRefresh() {
  await betStore.initialize()
}

// Initialize on mount
onMounted(async () => {
  if (!isInitialized.value) {
    await betStore.initialize()
  }
})

// Refresh on view switch (SSE handles real-time updates, so no periodic polling needed)
watch(showHistory, async () => {
  // Refresh immediately when switching views to get fresh data
  if (showHistory.value) {
    await betStore.fetchAllBets()
  } else {
    await betStore.refreshActiveBets()
  }
})
</script>

<style scoped>
/* Header */
.dashboard-header {
  margin-bottom: var(--spacing-xl);
}

.dashboard-header h1 {
  margin: 0;
  font-size: var(--font-size-display);
  color: var(--color-text);
}

/* View Toggle Section */
.view-toggle-section {
  margin-bottom: var(--spacing-xl);
}

.error-message {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
}

/* View switch transition */
.view-switch-enter-active,
.view-switch-leave-active {
  transition: all var(--transition-normal);
}

.view-switch-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.view-switch-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

