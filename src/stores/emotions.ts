import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, ApiError } from '@/services/api'
import { useAuthStore } from './auth'
import type { LogDoc, EmotionTrends, LogBeforeParams, LogAfterParams } from '@/types/api'

export const useEmotionsStore = defineStore('emotions', () => {
  // State
  const emotionLogs = ref<LogDoc[]>([])
  const emotionTrends = ref<EmotionTrends | null>(null)
  const emotionAnalysis = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const beforeEmotions = computed(() => 
    emotionLogs.value.filter(log => log.phase === 'before')
  )
  
  const afterEmotions = computed(() => 
    emotionLogs.value.filter(log => log.phase === 'after')
  )
  
  const recentEmotions = computed(() => 
    emotionLogs.value
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  )

  const getEmotionsByTask = computed(() => (taskId: string) => 
    emotionLogs.value.filter(log => log.task === taskId)
  )

  const getEmotionCounts = computed(() => {
    const counts: Record<string, number> = {}
    emotionLogs.value.forEach(log => {
      counts[log.emotion] = (counts[log.emotion] || 0) + 1
    })
    return counts
  })

  // Actions
  const setError = (message: string) => {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  const logBeforeEmotion = async (taskId: string, emotion: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.logBefore({
        user: authStore.user,
        task: taskId,
        emotion
      })
      
      emotionLogs.value.push(response.log)
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to log before emotion'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logAfterEmotion = async (taskId: string, emotion: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.logAfter({
        user: authStore.user,
        task: taskId,
        emotion
      })
      
      emotionLogs.value.push(response.log)
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to log after emotion'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchEmotionTrends = async (): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.viewEmotionTrends(authStore.user)
      emotionTrends.value = response.trends
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch emotion trends'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const analyzeRecentEmotions = async (): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.analyzeRecentEmotions(authStore.user)
      emotionAnalysis.value = response.analysis
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to analyze emotions'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteTaskLogs = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteTaskLogs({
        user: authStore.user,
        task: taskId
      })
      
      emotionLogs.value = emotionLogs.value.filter(log => log.task !== taskId)
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete task logs'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteAllUserLogs = async (): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteUserLogs(authStore.user)
      
      emotionLogs.value = []
      emotionTrends.value = null
      emotionAnalysis.value = null
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete all logs'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const clearEmotions = () => {
    emotionLogs.value = []
    emotionTrends.value = null
    emotionAnalysis.value = null
  }

  return {
    // State
    emotionLogs,
    emotionTrends,
    emotionAnalysis,
    isLoading,
    error,
    
    // Getters
    beforeEmotions,
    afterEmotions,
    recentEmotions,
    getEmotionsByTask,
    getEmotionCounts,
    
    // Actions
    logBeforeEmotion,
    logAfterEmotion,
    fetchEmotionTrends,
    analyzeRecentEmotions,
    deleteTaskLogs,
    deleteAllUserLogs,
    clearEmotions
  }
})
