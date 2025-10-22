import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, ApiError } from '@/services/api'
import { useAuthStore } from './auth'
import type { NudgeDoc, ScheduleNudgeParams, NudgeUserParams } from '@/types/api'

export const useNudgesStore = defineStore('nudges', () => {
  // State
  const nudges = ref<NudgeDoc[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const scheduledNudges = computed(() => 
    nudges.value.filter(nudge => !nudge.triggered && !nudge.canceled)
  )
  
  const triggeredNudges = computed(() => 
    nudges.value.filter(nudge => nudge.triggered)
  )
  
  const canceledNudges = computed(() => 
    nudges.value.filter(nudge => nudge.canceled)
  )
  
  const readyNudges = computed(() => 
    nudges.value.filter(nudge => 
      !nudge.triggered && 
      !nudge.canceled && 
      new Date(nudge.deliveryTime) <= new Date()
    )
  )

  const getNudgeByTask = computed(() => (taskId: string) => 
    nudges.value.find(nudge => nudge.task === taskId)
  )

  const upcomingNudges = computed(() => 
    nudges.value
      .filter(nudge => 
        !nudge.triggered && 
        !nudge.canceled && 
        new Date(nudge.deliveryTime) > new Date()
      )
      .sort((a, b) => new Date(a.deliveryTime).getTime() - new Date(b.deliveryTime).getTime())
  )

  // Actions
  const setError = (message: string) => {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  const scheduleNudge = async (taskId: string, deliveryTime: Date): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.scheduleNudge({
        user: authStore.user,
        task: taskId,
        deliveryTime
      })
      
      nudges.value.push(response.nudge)
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to schedule nudge'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const cancelNudge = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.cancelNudge({
        user: authStore.user,
        task: taskId
      })
      
      const nudge = nudges.value.find(n => n.task === taskId)
      if (nudge) {
        nudge.canceled = true
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to cancel nudge'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const nudgeUser = async (
    taskId: string, 
    title: string, 
    description: string, 
    recentEmotions: string[]
  ): Promise<{ message: string } | null> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return null
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.nudgeUser({
        user: authStore.user,
        task: taskId,
        title,
        description,
        recentEmotions
      })
      
      const nudge = nudges.value.find(n => n.task === taskId)
      if (nudge) {
        nudge.triggered = true
      }
      
      return { message: response.message }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to nudge user'
      setError(errorMessage)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteAllUserNudges = async (): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteUserNudges(authStore.user)
      
      nudges.value = []
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete all nudges'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const clearNudges = () => {
    nudges.value = []
  }

  return {
    // State
    nudges,
    isLoading,
    error,
    
    // Getters
    scheduledNudges,
    triggeredNudges,
    canceledNudges,
    readyNudges,
    getNudgeByTask,
    upcomingNudges,
    
    // Actions
    scheduleNudge,
    cancelNudge,
    nudgeUser,
    deleteAllUserNudges,
    clearNudges
  }
})