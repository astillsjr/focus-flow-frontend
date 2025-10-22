import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, ApiError } from '@/services/api'
import type { User, AuthResponse, RegisterParams, LoginParams } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isLoggedIn = computed(() => isAuthenticated.value)

  // Actions
  const setTokens = (tokens: AuthResponse) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    apiService.setAccessToken(tokens.accessToken)
    
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    apiService.setAccessToken(null)
    
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const setError = (message: string) => {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  const register = async (params: RegisterParams): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.register(params)
      setTokens(response)
      
      // Extract user ID from token or set a placeholder
      user.value = 'new-user' // This should be extracted from the token in a real implementation
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Registration failed'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const login = async (params: LoginParams): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.login(params)
      setTokens(response)
      
      // Extract user ID from token or set a placeholder
      user.value = 'logged-in-user' // This should be extracted from the token in a real implementation
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Login failed'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (refreshToken.value) {
        await apiService.logout(refreshToken.value)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearTokens()
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!accessToken.value) {
      setError('Not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.changePassword({
        accessToken: accessToken.value,
        oldPassword,
        newPassword
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Password change failed'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteAccount = async (password: string): Promise<boolean> => {
    if (!accessToken.value) {
      setError('Not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteAccount({
        accessToken: accessToken.value,
        password
      })
      
      clearTokens()
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Account deletion failed'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await apiService.refreshAccessToken(refreshToken.value)
      accessToken.value = response.accessToken
      apiService.setAccessToken(response.accessToken)
      localStorage.setItem('accessToken', response.accessToken)
      return true
    } catch (err) {
      clearTokens()
      return false
    }
  }

  const initializeAuth = () => {
    if (accessToken.value) {
      apiService.setAccessToken(accessToken.value)
      // In a real app, you'd decode the token to get the user ID
      user.value = 'authenticated-user'
    }
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isLoggedIn,
    
    // Actions
    register,
    login,
    logout,
    changePassword,
    deleteAccount,
    refreshAccessToken,
    initializeAuth,
    clearTokens,
    setError
  }
})