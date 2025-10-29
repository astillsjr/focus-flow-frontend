<template>
  <DashboardLayout>
    <h1>Bets</h1>

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
      <BetStats />
      <BetList ref="betListRef" />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBetStore } from '../../stores/betStore'
import DashboardLayout from '../layout/DashboardLayout.vue'
import BetStats from './BetStats.vue'
import BetList from './BetList.vue'
import { BaseButton, BaseCard } from '../base'

// Get bet store
const betStore = useBetStore()

// Local state
const isInitializing = ref(false)
const betListRef = ref<InstanceType<typeof BetList> | null>(null)

// Computed properties from store
const isInitialized = computed(() => betStore.isInitialized)
const isLoading = computed(() => betStore.isLoading)
const error = computed(() => betStore.error)

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
})
</script>

<style scoped>
h1 {
  margin-bottom: 2rem;
}

.error-message {
  color: #d32f2f;
  margin-bottom: 1rem;
}
</style>

