<template>
  <DashboardLayout>
    <!-- Header with username -->
    <div class="dashboard-header">
      <h1>Welcome, {{ displayUsername }}</h1>
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
          <BetList ref="betListRef" />
        </div>

        <!-- Bet History View -->
        <div v-else key="history">
          <BetHistory ref="betHistoryRef" />
        </div>
      </Transition>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBetStore } from '../../stores/betStore'
import { useAuthStore } from '../../stores/authStore'
import DashboardLayout from '../layout/DashboardLayout.vue'
import BetStats from './BetStats.vue'
import BetList from './BetList.vue'
import BetHistory from './BetHistory.vue'
import { BaseButton, BaseCard } from '../base'

// Get stores
const betStore = useBetStore()
const authStore = useAuthStore()

// Local state
const isInitializing = ref(false)
const showHistory = ref(false)
const betListRef = ref<InstanceType<typeof BetList> | null>(null)
const betHistoryRef = ref<InstanceType<typeof BetHistory> | null>(null)

// Computed properties from store
const isInitialized = computed(() => betStore.isInitialized)
const isLoading = computed(() => betStore.isLoading)
const error = computed(() => betStore.error)
const displayUsername = computed(() => authStore.username || 'User')

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
    console.log('✅ Betting profile initialized successfully')
  } catch (err) {
    console.error('❌ Failed to initialize betting profile:', err)
  } finally {
    isInitializing.value = false
  }
}

/**
 * Refresh betting data
 */
async function handleRefresh() {
  try {
    await betStore.initialize()
    console.log('✅ Betting data refreshed successfully')
  } catch (err) {
    console.error('❌ Failed to refresh betting data:', err)
  }
}

// Initialize on mount
onMounted(async () => {
  if (!isInitialized.value) {
    await betStore.initialize()
  }
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// Auto-refresh every 60s while this view is mounted
const refreshIntervalId = ref<ReturnType<typeof setInterval> | null>(null)

function stopAutoRefresh() {
  if (refreshIntervalId.value) {
    clearInterval(refreshIntervalId.value)
    refreshIntervalId.value = null
  }
}

async function doRefreshNow() {
  if (showHistory.value) {
    await betStore.fetchAllBets()
  } else {
    await betStore.fetchActiveBets()
    await betStore.checkAndResolveExpiredBets()
  }
}

function startAutoRefresh() {
  stopAutoRefresh()
  refreshIntervalId.value = setInterval(() => {
    void doRefreshNow()
  }, 60000)
}

watch(showHistory, async () => {
  // Immediate refresh on view switch, then keep interval running
  await doRefreshNow()
  startAutoRefresh()
})
</script>

<style scoped>
/* Header */
.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #FFFFFF;
}

/* View Toggle Section */
.view-toggle-section {
  margin-bottom: 2rem;
}

.error-message {
  color: #CF6679;
  margin-bottom: 1rem;
}

/* View switch transition */
.view-switch-enter-active,
.view-switch-leave-active {
  transition: all 0.25s ease;
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

