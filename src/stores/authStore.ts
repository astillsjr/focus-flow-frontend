import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// TypeScript interfaces
interface AuthState {
  userId: string | null
  accessToken: string | null
  refreshToken: string | null
  username: string | null
  email: string | null
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterCredentials {
  username: string
  password: string
  email: string
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
}

interface UserInfo {
  id: string
  username: string
  email: string
}

// API Base URL - adjust this based on your environment
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL

export const useAuthStore = defineStore('auth', () => {
  // State
  const userId = ref<string | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const username = ref<string | null>(null)
  const email = ref<string | null>(null)
  
  // Auto-refresh timer reference
  let refreshInterval: number | null = null

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
      const response = await fetch(`${API_BASE_URL}/UserAuthentication/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      const authResponse: AuthResponse = data

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
      const response = await fetch(`${API_BASE_URL}/UserAuthentication/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      const authResponse: AuthResponse = data

      // Store tokens
      accessToken.value = authResponse.accessToken
      refreshToken.value = authResponse.refreshToken

      // Fetch user info to get userId, username, and email
      await fetchUserInfo()

      // Persist to localStorage
      persistToLocalStorage()

      // Start auto-refresh
      startAutoRefresh()
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
        await fetch(`${API_BASE_URL}/UserAuthentication/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refreshToken: refreshToken.value
          })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with local cleanup even if server call fails
    } finally {
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
      const response = await fetch(`${API_BASE_URL}/UserAuthentication/refreshAccessToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: refreshToken.value
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed')
      }

      // Update access token
      accessToken.value = data.accessToken

      // Persist updated token to localStorage
      persistToLocalStorage()
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
      const response = await fetch(`${API_BASE_URL}/UserAuthentication/getUserInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: accessToken.value
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user info')
      }

      const userInfo: UserInfo = data.user

      // Store user information
      userId.value = userInfo.id
      username.value = userInfo.username
      email.value = userInfo.email

      // Persist to localStorage
      persistToLocalStorage()
    } catch (error) {
      console.error('Fetch user info error:', error)
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
    initialize
  }
})

