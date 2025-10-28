import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { VALID_EMOTIONS, EMOTION_LABELS, isValidEmotion, type Emotion } from '@/constants/emotions'
import * as emotionAPI from '@/api/emotions'
import type { EmotionLog, EmotionStats, TaskEmotions } from '@/api/emotions'

// Re-export types for convenience
export type { EmotionLog, EmotionStats, TaskEmotions }

// Local interfaces for store-specific payloads
export interface LogEmotionPayload {
  taskId: string
  emotion: string
}

export interface GetEmotionLogsParams {
  page?: number
  limit?: number
  phase?: 'before' | 'after'
  emotion?: string
  sortBy?: string
  sortOrder?: 1 | -1
}

export const useEmotionStore = defineStore('emotion', () => {
  // State
  const emotionLogs = ref<EmotionLog[]>([])
  const stats = ref<EmotionStats | null>(null)
  const analysis = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get auth store
  const authStore = useAuthStore()

  // Getters
  const beforeLogs = computed(() => {
    return emotionLogs.value.filter(log => log.phase === 'before')
  })

  const afterLogs = computed(() => {
    return emotionLogs.value.filter(log => log.phase === 'after')
  })

  const logsByTask = computed(() => {
    const grouped: Record<string, { before?: EmotionLog; after?: EmotionLog }> = {}
    
    emotionLogs.value.forEach(log => {
      if (!grouped[log.task]) {
        grouped[log.task] = {}
      }
      grouped[log.task][log.phase] = log
    })
    
    return grouped
  })

  const hasLogs = computed(() => emotionLogs.value.length > 0)

  // Actions

  /**
   * Log emotion before starting a task
   */
  async function logBefore(payload: LogEmotionPayload): Promise<string> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await emotionAPI.logBefore(authStore.userId, payload.taskId, payload.emotion)

      // Refresh emotion logs to get the newly created log
      await fetchEmotionLogs()

      return data.log
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to log before emotion'
      console.error('Log before emotion error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Log emotion after completing a task
   */
  async function logAfter(payload: LogEmotionPayload): Promise<string> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await emotionAPI.logAfter(authStore.userId, payload.taskId, payload.emotion)

      // Refresh emotion logs to get the newly created log
      await fetchEmotionLogs()

      return data.log
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to log after emotion'
      console.error('Log after emotion error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete all emotion logs for a specific task
   */
  async function deleteTaskLogs(taskId: string): Promise<void> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await emotionAPI.deleteTaskLogs(authStore.userId, taskId)

      // Remove logs from local state
      emotionLogs.value = emotionLogs.value.filter(log => log.task !== taskId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete task logs'
      console.error('Delete task logs error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete all emotion logs for the current user
   */
  async function deleteUserLogs(): Promise<void> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await emotionAPI.deleteUserLogs(authStore.userId)

      // Clear all logs from local state
      emotionLogs.value = []
      stats.value = null
      analysis.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user logs'
      console.error('Delete user logs error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get emotion statistics for the current user
   */
  async function fetchEmotionStats(): Promise<void> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await emotionAPI.getEmotionStats(authStore.userId)

      stats.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch emotion stats'
      console.error('Fetch emotion stats error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Analyze recent emotions for the current user
   */
  async function analyzeRecentEmotions(): Promise<void> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await emotionAPI.analyzeRecentEmotions(authStore.userId)

      analysis.value = data.analysis
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze recent emotions'
      console.error('Analyze recent emotions error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get emotions for a specific task
   */
  async function getEmotionsForTask(taskId: string): Promise<TaskEmotions> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await emotionAPI.getEmotionsForTask(authStore.userId, taskId)

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get emotions for task'
      console.error('Get emotions for task error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch emotion logs with optional filtering and pagination
   */
  async function fetchEmotionLogs(params: GetEmotionLogsParams = {}): Promise<void> {
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await emotionAPI.getEmotionLogs({
        user: authStore.userId,
        page: params.page || 1,
        limit: params.limit || 100,
        phase: params.phase,
        emotion: params.emotion,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || -1
      })

      // Update emotion logs in store
      emotionLogs.value = result.logs
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch emotion logs'
      console.error('Fetch emotion logs error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear all emotion data (used on logout)
   */
  function clearEmotions(): void {
    emotionLogs.value = []
    stats.value = null
    analysis.value = null
    error.value = null
    isLoading.value = false
  }

  /**
   * Initialize emotions for the current user
   */
  async function initialize(): Promise<void> {
    if (authStore.isAuthenticated) {
      try {
        await Promise.all([
          fetchEmotionLogs(),
          fetchEmotionStats().catch(() => {
            // Stats might fail if user has no logs yet, that's okay
            console.log('No emotion stats available yet')
          })
        ])
      } catch (err) {
        console.error('Failed to initialize emotions:', err)
      }
    }
  }

  return {
    // State
    emotionLogs,
    stats,
    analysis,
    isLoading,
    error,

    // Getters
    beforeLogs,
    afterLogs,
    logsByTask,
    hasLogs,

    // Actions
    logBefore,
    logAfter,
    deleteTaskLogs,
    deleteUserLogs,
    fetchEmotionStats,
    analyzeRecentEmotions,
    getEmotionsForTask,
    fetchEmotionLogs,
    clearEmotions,
    initialize
  }
})

// Re-export emotion constants for convenience
export { VALID_EMOTIONS, EMOTION_LABELS, isValidEmotion, type Emotion }

