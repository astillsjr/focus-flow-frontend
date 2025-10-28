import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'

// TypeScript interfaces
export interface Bet {
  _id: string
  user: string
  task: string
  wager: number
  deadline: Date | string
  taskDueDate?: Date | string
  success?: boolean
  createdAt: Date | string
}

export interface BettorProfile {
  points: number
  streak: number
  totalBets: number
  successfulBets: number
  failedBets: number
  pendingBets: number
}

export interface PlaceBetPayload {
  taskId: string
  wager: number
  deadline: Date | string
  taskDueDate?: Date | string
}

export interface ResolveBetResponse {
  status: 'already_resolved' | 'success'
  reward?: number
}

// API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

/**
 * Helper to handle API responses consistently
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }
  
  // Check if the response contains an error field even with 200 status
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(data.error || 'API returned an error')
  }
  
  return data as T
}

export const useBetStore = defineStore('bet', () => {
  // State
  const bets = ref<Bet[]>([])
  const profile = ref<BettorProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/initializeBettor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId
        })
      })

      await handleResponse(response)

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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/getUserProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId
        })
      })

      const data = await handleResponse<BettorProfile>(response)
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/getActiveBets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId
        })
      })

      const data = await handleResponse<Bet[]>(response)
      
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
   * Fetch expired bets for the current user
   */
  async function fetchExpiredBets(): Promise<Bet[]> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/getExpiredBets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId
        })
      })

      const data = await handleResponse<Bet[]>(response)
      
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    if (!hasProfile.value) {
      throw new Error('Betting profile not initialized')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/placeBet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: payload.taskId,
          wager: payload.wager,
          deadline: payload.deadline,
          taskDueDate: payload.taskDueDate
        })
      })

      const data = await handleResponse<{ bet: string }>(response)

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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/cancelBet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: taskId
        })
      })

      await handleResponse(response)

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
   * Resolve a bet when a task is started/completed
   */
  async function resolveBet(taskId: string, completionTime?: Date | string): Promise<ResolveBetResponse> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/resolveBet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: taskId,
          completionTime: completionTime || new Date().toISOString()
        })
      })

      const data = await handleResponse<ResolveBetResponse>(response)

      // Refresh active bets and profile
      await Promise.all([fetchActiveBets(), fetchProfile()])

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to resolve bet'
      console.error('Resolve bet error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resolve an expired bet (marked as failed)
   */
  async function resolveExpiredBet(taskId: string): Promise<void> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/resolveExpiredBet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: taskId
        })
      })

      await handleResponse(response)

      // Refresh active bets and profile
      await Promise.all([fetchActiveBets(), fetchProfile()])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to resolve expired bet'
      console.error('Resolve expired bet error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a specific bet for a task
   */
  async function getBet(taskId: string): Promise<Bet | null> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/getBet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: taskId
        })
      })

      const data = await handleResponse<Bet>(response)
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/MicroBet/getRecentActivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          limit
        })
      })

      const data = await handleResponse<Bet[]>(response)
      
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
   * Check and resolve any expired bets
   */
  async function checkAndResolveExpiredBets(): Promise<void> {
    try {
      const expired = await fetchExpiredBets()
      
      if (expired.length > 0) {
        // Resolve all expired bets
        await Promise.all(
          expired.map(bet => resolveExpiredBet(bet.task))
        )
      }
    } catch (err) {
      console.error('Error checking expired bets:', err)
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
    fetchExpiredBets,
    placeBet,
    cancelBet,
    resolveBet,
    resolveExpiredBet,
    getBet,
    getRecentActivity,
    checkAndResolveExpiredBets,
    getBetByTaskId,
    hasActiveBet,
    clearState,
    initialize
  }
})

