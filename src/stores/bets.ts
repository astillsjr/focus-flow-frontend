import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, ApiError } from '@/services/api'
import { useAuthStore } from './auth'
import type { BetDoc, PlaceBetParams, ResolveBetParams } from '@/types/api'

export const useBetsStore = defineStore('bets', () => {
  // State
  const bets = ref<BetDoc[]>([])
  const userProfile = ref<{ points: number; streak: number } | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pendingBets = computed(() => 
    bets.value.filter(bet => bet.success === undefined)
  )
  
  const successfulBets = computed(() => 
    bets.value.filter(bet => bet.success === true)
  )
  
  const failedBets = computed(() => 
    bets.value.filter(bet => bet.success === false)
  )
  
  const activeBets = computed(() => 
    bets.value.filter(bet => 
      bet.success === undefined && 
      new Date(bet.deadline) > new Date()
    )
  )
  
  const expiredBets = computed(() => 
    bets.value.filter(bet => 
      bet.success === undefined && 
      new Date(bet.deadline) <= new Date()
    )
  )

  const getBetByTask = computed(() => (taskId: string) => 
    bets.value.find(bet => bet.task === taskId)
  )

  const totalWagered = computed(() => 
    bets.value.reduce((total, bet) => total + bet.wager, 0)
  )

  const totalRewards = computed(() => 
    bets.value
      .filter(bet => bet.success === true)
      .reduce((total, bet) => total + (bet.wager * 2), 0) // Assuming 2x reward
  )

  // Actions
  const setError = (message: string) => {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  const initializeBettor = async (): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.initializeBettor(authStore.user)
      
      userProfile.value = { points: 0, streak: 0 }
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to initialize bettor'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const placeBet = async (taskId: string, wager: number, deadline: Date): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.placeBet({
        user: authStore.user,
        task: taskId,
        wager,
        deadline
      })
      
      bets.value.push(response.bet)
      
      // Update user profile points
      if (userProfile.value) {
        userProfile.value.points -= wager
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to place bet'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const cancelBet = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.cancelBet({
        user: authStore.user,
        task: taskId
      })
      
      const bet = bets.value.find(b => b.task === taskId)
      if (bet) {
        bets.value = bets.value.filter(b => b._id !== bet._id)
        
        // Refund points
        if (userProfile.value) {
          userProfile.value.points += bet.wager
        }
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to cancel bet'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resolveBet = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.resolveBet({
        user: authStore.user,
        task: taskId,
        completionTime: new Date()
      })
      
      const bet = bets.value.find(b => b.task === taskId)
      if (bet) {
        bet.success = true
        
        // Award points and increase streak
        if (userProfile.value && response.reward) {
          userProfile.value.points += response.reward
          userProfile.value.streak += 1
        }
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to resolve bet'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resolveExpiredBet = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.resolveExpiredBet({
        user: authStore.user,
        task: taskId
      })
      
      const bet = bets.value.find(b => b.task === taskId)
      if (bet) {
        bet.success = false
        
        // Reset streak
        if (userProfile.value) {
          userProfile.value.streak = 0
        }
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to resolve expired bet'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchBetHistory = async (status?: 'pending' | 'success' | 'failure'): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const betHistory = await apiService.viewBetHistory(authStore.user, status)
      bets.value = betHistory
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch bet history'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const clearBets = () => {
    bets.value = []
    userProfile.value = null
  }

  return {
    // State
    bets,
    userProfile,
    isLoading,
    error,
    
    // Getters
    pendingBets,
    successfulBets,
    failedBets,
    activeBets,
    expiredBets,
    getBetByTask,
    totalWagered,
    totalRewards,
    
    // Actions
    initializeBettor,
    placeBet,
    cancelBet,
    resolveBet,
    resolveExpiredBet,
    fetchBetHistory,
    clearBets
  }
})