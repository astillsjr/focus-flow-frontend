import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import * as betAPI from '@/api/bets'
import type { Bet, UserProfile as BettorProfile } from '@/api/bets'

// Re-export types for convenience
export type { Bet, BettorProfile }

// Local interfaces for store-specific payloads
export interface PlaceBetPayload {
  taskId: string
  wager: number
  deadline: Date | string
  taskDueDate?: Date | string
}

export const useBetStore = defineStore('bet', () => {
  // State
  const bets = ref<Bet[]>([])
  const profile = ref<BettorProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const expirationCheckInterval = ref<ReturnType<typeof setInterval> | null>(null)

  // Get auth store
  const authStore = useAuthStore()

  // Getters
  const activeBets = computed(() => {
    return bets.value.filter(bet => bet.success === undefined)
  })

  const expiredBets = computed(() => {
    const now = new Date()
    return activeBets.value.filter(bet => new Date(bet.deadline) < now)
  })

  const resolvedBets = computed(() => {
    return bets.value.filter(bet => bet.success !== undefined)
  })

  const successfulBets = computed(() => {
    return bets.value.filter(bet => bet.success === true)
  })

  const failedBets = computed(() => {
    return bets.value.filter(bet => bet.success === false)
  })

  const pendingBets = computed(() => {
    return activeBets.value.filter(bet => new Date(bet.deadline) >= new Date())
  })

  const totalWagered = computed(() => {
    return activeBets.value.reduce((sum, bet) => sum + bet.wager, 0)
  })

  const hasProfile = computed(() => {
    return profile.value !== null
  })

  const points = computed(() => {
    return profile.value?.points ?? 0
  })

  const streak = computed(() => {
    return profile.value?.streak ?? 0
  })

  const stats = computed(() => {
    if (!profile.value) return null
    return {
      points: profile.value.points,
      streak: profile.value.streak,
      totalBets: profile.value.totalBets,
      successfulBets: profile.value.successfulBets,
      failedBets: profile.value.failedBets,
      pendingBets: profile.value.pendingBets,
      successRate: profile.value.totalBets > 0 
        ? Math.round((profile.value.successfulBets / profile.value.totalBets) * 100) 
        : 0
    }
  })

  // Actions

  /**
   * Initialize a betting profile for the current user
   */
  async function initializeBettor(): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await betAPI.initializeBettor(authStore.accessToken)

      // Fetch the profile after initialization
      await fetchProfile()
      
      // Persist initialization flag
      persistInitializedFlag()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize bettor'
      console.error('Initialize bettor error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch the user's betting profile
   */
  async function fetchProfile(): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await betAPI.getUserProfile(authStore.accessToken)
      profile.value = data
      isInitialized.value = true
      
      // Persist to localStorage
      persistProfile()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      console.error('Fetch profile error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch all active bets for the current user
   */
  async function fetchActiveBets(): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await betAPI.getActiveBets(authStore.accessToken)
      
      // Sanity check - ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data for bets:', data)
        bets.value = []
      } else {
        bets.value = data
      }
      
      // Persist to localStorage
      persistBets()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch active bets'
      console.error('Fetch active bets error:', err)
      // Ensure bets remains an array even on error
      if (!Array.isArray(bets.value)) {
        bets.value = []
      }
      // If profile doesn't exist, don't throw - just leave bets empty
      if (err instanceof Error && err.message.includes('profile not found')) {
        return
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch all bets (including resolved) for the current user
   */
  async function fetchAllBets(): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await betAPI.getRecentActivity(authStore.accessToken, 1000) // Get up to 1000 bets
      
      // Sanity check - ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data for bets:', data)
        bets.value = []
      } else {
        bets.value = data
      }
      
      // Persist to localStorage
      persistBets()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch all bets'
      console.error('Fetch all bets error:', err)
      // Ensure bets remains an array even on error
      if (!Array.isArray(bets.value)) {
        bets.value = []
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch expired bets for the current user
   */
  async function fetchExpiredBets(): Promise<Bet[]> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await betAPI.getExpiredBets(authStore.accessToken)
      
      // Sanity check - ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data for expired bets:', data)
        return []
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch expired bets'
      console.error('Fetch expired bets error:', err)
      // If profile doesn't exist, return empty array instead of throwing
      if (err instanceof Error && err.message.includes('profile not found')) {
        return []
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Place a new bet on a task
   */
  async function placeBet(payload: PlaceBetPayload): Promise<string> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    if (!hasProfile.value) {
      throw new Error('Betting profile not initialized')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await betAPI.placeBet(authStore.accessToken, {
        task: payload.taskId,
        wager: payload.wager,
        deadline: payload.deadline,
        taskDueDate: payload.taskDueDate ?? null
      })

      // Refresh active bets and profile
      await Promise.all([fetchActiveBets(), fetchProfile()])

      return data.bet
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to place bet'
      console.error('Place bet error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cancel a bet for a task
   */
  async function cancelBet(taskId: string): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await betAPI.cancelBet(authStore.accessToken, taskId)

      // Remove bet from local state
      bets.value = bets.value.filter(bet => bet.task !== taskId)

      // Refresh profile to get updated points
      await fetchProfile()
      
      // Persist changes
      persistBets()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel bet'
      console.error('Cancel bet error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a specific bet for a task
   */
  async function getBet(taskId: string): Promise<Bet | null> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await betAPI.getBet(authStore.accessToken, taskId)
      return data
    } catch (err) {
      // If bet doesn't exist, return null instead of throwing
      if (err instanceof Error && err.message.includes('not found')) {
        return null
      }
      error.value = err instanceof Error ? err.message : 'Failed to get bet'
      console.error('Get bet error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get recent betting activity
   */
  async function getRecentActivity(limit: number = 10): Promise<Bet[]> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await betAPI.getRecentActivity(authStore.accessToken, limit ?? null)
      
      // Sanity check - ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data for recent activity:', data)
        return []
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get recent activity'
      console.error('Get recent activity error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check and refresh expired bets
   * Note: Backend automatically resolves bets when tasks start/complete
   * This function just refreshes the expired bets list
   */
  async function checkAndResolveExpiredBets(): Promise<void> {
    try {
      // Just refresh the expired bets list
      // Backend automatically resolves bets when tasks start/complete
      await fetchExpiredBets()
    } catch (err) {
      console.error('Error checking expired bets:', err)
    }
  }

  /**
   * Start periodic monitoring for expired bets
   * Checks every 2 minutes for bets that have expired
   */
  function startExpirationMonitoring(): void {
    // Don't start if already running
    if (expirationCheckInterval.value) {
      return
    }

    console.log('🔄 Starting automatic bet expiration monitoring...')
    
    // Check every 2 minutes (120000 ms)
    expirationCheckInterval.value = setInterval(async () => {
      console.log('⏰ Checking for expired bets...')
      await checkAndResolveExpiredBets()
    }, 2 * 60 * 1000)
  }

  /**
   * Stop periodic monitoring for expired bets
   */
  function stopExpirationMonitoring(): void {
    if (expirationCheckInterval.value) {
      console.log('⏹️ Stopping automatic bet expiration monitoring')
      clearInterval(expirationCheckInterval.value)
      expirationCheckInterval.value = null
    }
  }

  /**
   * Find a bet by task ID in local state
   */
  function getBetByTaskId(taskId: string): Bet | undefined {
    return bets.value.find(bet => bet.task === taskId)
  }

  /**
   * Check if a task has an active bet
   */
  function hasActiveBet(taskId: string): boolean {
    return activeBets.value.some(bet => bet.task === taskId)
  }

  /**
   * Persist profile to localStorage
   */
  function persistProfile(): void {
    if (profile.value) {
      localStorage.setItem('betProfile', JSON.stringify(profile.value))
    }
  }

  /**
   * Persist bets to localStorage
   */
  function persistBets(): void {
    localStorage.setItem('bets', JSON.stringify(bets.value))
  }

  /**
   * Persist initialization flag
   */
  function persistInitializedFlag(): void {
    if (authStore.userId) {
      localStorage.setItem('bettorInitialized', authStore.userId)
    }
  }

  /**
   * Clear localStorage
   */
  function clearLocalStorage(): void {
    localStorage.removeItem('betProfile')
    localStorage.removeItem('bets')
    localStorage.removeItem('bettorInitialized')
  }

  /**
   * Clear store state
   */
  function clearState(): void {
    stopExpirationMonitoring()
    bets.value = []
    profile.value = null
    error.value = null
    isLoading.value = false
    isInitialized.value = false
  }

  /**
   * Initialize the bet store (call on app startup)
   */
  async function initialize(): Promise<void> {
    if (!authStore.isAuthenticated || !authStore.userId) {
      return
    }

    // Check if already initialized from localStorage
    const storedProfile = localStorage.getItem('betProfile')
    const storedBets = localStorage.getItem('bets')
    const bettorInitialized = localStorage.getItem('bettorInitialized')

    if (storedProfile) {
      try {
        profile.value = JSON.parse(storedProfile)
      } catch (err) {
        console.error('Failed to parse stored profile:', err)
      }
    }

    if (storedBets) {
      try {
        const parsed = JSON.parse(storedBets)
        // Ensure bets is always an array
        bets.value = Array.isArray(parsed) ? parsed : []
      } catch (err) {
        console.error('Failed to parse stored bets:', err)
        bets.value = []
      }
    } else {
      // Ensure bets starts as empty array if no stored data
      bets.value = []
    }

    // Try to fetch profile from server
    try {
      console.log('📊 Fetching betting profile...')
      await fetchProfile()
      isInitialized.value = true
      console.log('✅ Betting profile loaded successfully')
    } catch (err) {
      console.log('⚠️ Profile fetch failed:', err instanceof Error ? err.message : err)
      // If profile doesn't exist and not already initialized, initialize it
      if (bettorInitialized !== authStore.userId) {
        try {
          console.log('🔄 Initializing new bettor profile...')
          await initializeBettor()
          isInitialized.value = true
          console.log('✅ Bettor profile initialized successfully')
        } catch (initErr) {
          console.error('❌ Failed to initialize bettor:', initErr)
          // If initialization fails, stop here - don't try to fetch bets
          return
        }
      } else {
        // Profile doesn't exist and we can't/shouldn't initialize
        console.log('⚠️ Betting profile not initialized yet - user needs to initialize manually')
        return
      }
    }

    // Only fetch bets if profile exists
    if (!isInitialized.value) {
      console.log('Skipping bet fetches - profile not initialized')
      return
    }

    // Fetch active bets
    try {
      await fetchActiveBets()
    } catch (err) {
      console.error('Failed to fetch active bets:', err)
    }

    // Check for expired bets
    try {
      await checkAndResolveExpiredBets()
    } catch (err) {
      console.error('Failed to check expired bets:', err)
    }

    // Start periodic monitoring for bet expiration
    startExpirationMonitoring()
  }

  // Watch for logout and clear state automatically
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        clearState()
        clearLocalStorage()
      }
    }
  )

  return {
    // State
    bets,
    profile,
    isLoading,
    error,
    isInitialized,

    // Getters
    activeBets,
    expiredBets,
    resolvedBets,
    successfulBets,
    failedBets,
    pendingBets,
    totalWagered,
    hasProfile,
    points,
    streak,
    stats,

    // Actions
    initializeBettor,
    fetchProfile,
    fetchActiveBets,
    fetchAllBets,
    fetchExpiredBets,
    placeBet,
    cancelBet,
    getBet,
    getRecentActivity,
    checkAndResolveExpiredBets,
    getBetByTaskId,
    hasActiveBet,
    clearState,
    initialize
  }
})

