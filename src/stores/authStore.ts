import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBetStore } from './betStore'
import { useTaskStore } from './taskStore'
import { useEmotionStore } from './emotionStore'
import { useNudgeStore } from './nudgeStore'
import * as taskAPI from '@/api/tasks'
import * as emotionAPI from '@/api/emotions'
import * as nudgeAPI from '@/api/nudges'
import * as betAPI from '@/api/bets'
import * as authAPI from '@/api/auth'
import type { LoginCredentials, RegisterCredentials } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const userId = ref<string | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const username = ref<string | null>(null)
  const email = ref<string | null>(null)
  
  // Auto-refresh timer reference
  let refreshInterval: number | null = null
  
  // Unified SSE connection for all events
  let eventSource: EventSource | null = null

  // Getters
  const isAuthenticated = computed(() => {
    return !!(userId.value && accessToken.value && refreshToken.value)
  })

  const currentUser = computed(() => {
    if (!userId.value) return null
    return {
      id: userId.value,
      username: username.value,
      email: email.value
    }
  })

  // Actions
  
  /**
   * Register a new user
   */
  async function register(credentials: RegisterCredentials): Promise<void> {
    try {
      const authResponse = await authAPI.register(credentials)

      // Store tokens
      accessToken.value = authResponse.accessToken
      refreshToken.value = authResponse.refreshToken

      // Fetch user info to get userId
      await fetchUserInfo()

      // Store username and email from registration
      username.value = credentials.username
      email.value = credentials.email

      // Persist to localStorage
      persistToLocalStorage()

      // Start auto-refresh
      startAutoRefresh()

      // Initialize stores after successful registration
      const betStore = useBetStore()
      await betStore.initialize()
      
      const taskStore = useTaskStore()
      await taskStore.initialize()
      
      // Start unified SSE connection for real-time events
      startUnifiedSSEConnection()
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  /**
   * Login an existing user
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      const authResponse = await authAPI.login(credentials)

      // Store tokens
      accessToken.value = authResponse.accessToken
      refreshToken.value = authResponse.refreshToken

      // Fetch user info to get userId, username, and email
      await fetchUserInfo()

      // Persist to localStorage
      persistToLocalStorage()

      // Start auto-refresh
      startAutoRefresh()

      // Initialize stores after successful login
      const betStore = useBetStore()
      await betStore.initialize()
      
      // Initialize task store to load tasks before nudges are processed
      const taskStore = useTaskStore()
      await taskStore.initialize()
      
      // Start unified SSE connection for real-time events
      startUnifiedSSEConnection()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Logout the current user
   */
  async function logout(): Promise<void> {
    try {
      if (refreshToken.value) {
        // Call logout endpoint to invalidate refresh token on server
        await authAPI.logout(refreshToken.value)
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with local cleanup even if server call fails
    } finally {
      // Stop unified SSE connection
      stopUnifiedSSEConnection()
      
      // Clear state
      clearState()

      // Clear localStorage
      clearLocalStorage()

      // Stop auto-refresh
      stopAutoRefresh()
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  async function refreshAccessToken(): Promise<void> {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const data = await authAPI.refreshAccessToken(refreshToken.value)

      // Update access token
      accessToken.value = data.accessToken

      // Persist updated token to localStorage
      persistToLocalStorage()
      
      // Reconnect SSE with new token if connection exists
      if (eventSource) {
        stopUnifiedSSEConnection()
        startUnifiedSSEConnection()
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout the user
      await logout()
      throw error
    }
  }

  /**
   * Fetch user information using the access token
   */
  async function fetchUserInfo(): Promise<void> {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }

    try {
      const data = await authAPI.getUserInfo(accessToken.value)

      // Store user information
      userId.value = data.user.id
      username.value = data.user.username
      email.value = data.user.email

      // Persist to localStorage
      persistToLocalStorage()
    } catch (error) {
      console.error('Fetch user info error:', error)
      throw error
    }
  }

  /**
   * Change the current user's password
   */
  async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!accessToken.value) {
      throw new Error('Not authenticated')
    }
    try {
      await authAPI.changePassword(accessToken.value, oldPassword, newPassword)
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    }
  }

  /**
   * Delete the current user's account (logs out on success)
   */
  async function deleteAccount(password: string): Promise<void> {
    if (!accessToken.value) {
      throw new Error('Not authenticated')
    }
    if (!userId.value) {
      throw new Error('Missing user id')
    }
    try {
      // First, delete all user-associated data across services
      await Promise.allSettled([
        taskAPI.deleteUserTasks(accessToken.value),
        emotionAPI.deleteUserLogs(accessToken.value),
        nudgeAPI.deleteUserNudges(accessToken.value),
        betAPI.removeBettor(accessToken.value)
      ])

      // Then delete the account in authentication service
      await authAPI.deleteAccount(accessToken.value, password)

      // Clear local stores explicitly before logging out
      try {
        const taskStore = useTaskStore()
        taskStore.clearTasks()
      } catch {}
      try {
        const emotionStore = useEmotionStore()
        emotionStore.clearEmotions()
      } catch {}
      try {
        const betStore = useBetStore()
        betStore.clearState()
      } catch {}

      // Only logout after a successful deletion
      await logout()
    } catch (error) {
      console.error('Delete account error:', error)
      // Surface the error to the caller without logging out
      throw error
    }
  }

  /**
   * Initialize auth state from localStorage (call on app startup)
   */
  function initialize(): void {
    const storedUserId = localStorage.getItem('userId')
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUsername = localStorage.getItem('username')
    const storedEmail = localStorage.getItem('email')

    if (storedUserId && storedAccessToken && storedRefreshToken) {
      userId.value = storedUserId
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
      username.value = storedUsername
      email.value = storedEmail

      // Start auto-refresh
      startAutoRefresh()
      
      // Start unified SSE connection if authenticated
      startUnifiedSSEConnection()
    }
  }

  /**
   * Persist auth state to localStorage
   */
  function persistToLocalStorage(): void {
    if (userId.value) localStorage.setItem('userId', userId.value)
    if (accessToken.value) localStorage.setItem('accessToken', accessToken.value)
    if (refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value)
    if (username.value) localStorage.setItem('username', username.value)
    if (email.value) localStorage.setItem('email', email.value)
  }

  /**
   * Clear localStorage
   */
  function clearLocalStorage(): void {
    localStorage.removeItem('userId')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
  }

  /**
   * Clear state
   */
  function clearState(): void {
    userId.value = null
    accessToken.value = null
    refreshToken.value = null
    username.value = null
    email.value = null
  }

  /**
   * Start unified SSE connection for real-time events (nudges, bet events, etc.)
   */
  function startUnifiedSSEConnection(): void {
    if (!accessToken.value || eventSource) {
      return
    }

    try {
      // For SSE, connect directly to backend to avoid Vite proxy issues with long-lived connections
      // Use environment variable if set, otherwise default to backend URL
      const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api'
      const url = `${API_BASE_URL}/events/stream?accessToken=${accessToken.value}`
      
      eventSource = new EventSource(url)

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'connected':
              console.log('✅ Connected to unified event stream')
              // Backlog of missed events will be sent automatically
              break
              
            case 'nudge':
              // Route nudge events to nudge store
              const nudgeStore = useNudgeStore()
              nudgeStore.handleIncomingNudge(data.nudge)
              break
              
            case 'bet_resolved':
              // Bet was successfully resolved (task completed before deadline)
              const betStore = useBetStore()
              betStore.refreshActiveBets()
              console.log('✅ Bet resolved:', data.bet._id)
              break
              
            case 'bet_expired':
              // Bet expired (deadline passed without completion)
              const betStore2 = useBetStore()
              betStore2.refreshActiveBets()
              console.log('⏰ Bet expired:', data.bet._id)
              break
              
            case 'heartbeat':
              // Connection is alive (sent every 30 seconds)
              break
              
            case 'error':
              console.error('SSE error:', data.message)
              // On error, close connection and let it retry on next auth action
              stopUnifiedSSEConnection()
              break
          }
        } catch (error) {
          console.error('Error processing SSE message:', error)
        }
      })

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        // Close connection on error - will be reconnected on next auth action
        stopUnifiedSSEConnection()
      }

      console.log('📡 Started unified SSE connection for events')
    } catch (error) {
      console.error('Failed to start SSE:', error)
      eventSource = null
    }
  }

  /**
   * Stop unified SSE connection
   */
  function stopUnifiedSSEConnection(): void {
    if (eventSource) {
      eventSource.close()
      eventSource = null
      console.log('⏸️ Stopped unified SSE connection')
    }
  }

  /**
   * Start automatic token refresh every 14 minutes
   */
  function startAutoRefresh(): void {
    // Clear any existing interval
    stopAutoRefresh()

    // Set up new interval (14 minutes = 840000  milliseconds)
    refreshInterval = window.setInterval(async () => {
      try {
        await refreshAccessToken()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
      }
    }, 14 * 60 * 1000) // 14 minutes
  }

  /**
   * Stop automatic token refresh
   */
  function stopAutoRefresh(): void {
    if (refreshInterval !== null) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  return {
    // State
    userId,
    accessToken,
    refreshToken,
    username,
    email,
    
    // Getters
    isAuthenticated,
    currentUser,
    
    // Actions
    register,
    login,
    logout,
    refreshAccessToken,
    fetchUserInfo,
    initialize,
    changePassword,
    deleteAccount
  }
})

