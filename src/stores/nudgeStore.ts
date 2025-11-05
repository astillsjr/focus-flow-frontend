import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useTaskStore } from './taskStore'
import type { Nudge } from '../api/nudges'

export interface ActiveNudge {
  nudgeId: string
  taskId: string
  taskTitle: string
  message: string
  timestamp: Date
}

export const useNudgeStore = defineStore('nudge', () => {
  // State
  const activeNudges = ref<ActiveNudge[]>([])
  const nudgeQueue = ref<ActiveNudge[]>([])
  const pendingNudges = ref<Nudge[]>([]) // Queue for nudges waiting for tasks

  // Get auth and task stores
  const authStore = useAuthStore()
  const taskStore = useTaskStore()

  /**
   * Show the next nudge from the queue
   */
  function showNextNudge(): void {
    if (nudgeQueue.value.length > 0 && activeNudges.value.length === 0) {
      const nextNudge = nudgeQueue.value.shift()
      if (nextNudge) {
        activeNudges.value.push(nextNudge)
      }
    }
  }

  /**
   * Handle incoming nudge from SSE
   */
  function handleIncomingNudge(nudge: Nudge): void {
    // Check if already processed
    const alreadyQueued = nudgeQueue.value.some(n => n.nudgeId === nudge._id)
    const alreadyActive = activeNudges.value.some(n => n.nudgeId === nudge._id)
    
    if (alreadyQueued || alreadyActive) {
      return
    }

    // Only process triggered nudges with messages
    if (nudge.triggeredAt === null || !nudge.message) {
      return
    }

    const task = taskStore.getTaskById(nudge.task)
    if (!task) {
      // Queue this nudge to retry later when tasks are loaded
      if (!pendingNudges.value.some(n => n._id === nudge._id)) {
        pendingNudges.value.push(nudge)
      }
      return
    }

    // Use backend-provided message
    // Use triggeredAt timestamp if available (when it was actually triggered), otherwise deliveryTime
    nudgeQueue.value.push({
      nudgeId: nudge._id,
      taskId: nudge.task,
      taskTitle: task.title,
      message: nudge.message,
      timestamp: nudge.triggeredAt ? new Date(nudge.triggeredAt) : new Date(nudge.deliveryTime)
    })

    showNextNudge()
  }

  /**
   * Retry processing pending nudges (called when tasks are loaded)
   */
  function retryPendingNudges(): void {
    if (pendingNudges.value.length === 0) return

    const stillPending: Nudge[] = []
    
    for (const nudge of pendingNudges.value) {
      const task = taskStore.getTaskById(nudge.task)
      if (task) {
        // Task is now available, process the nudge
        handleIncomingNudge(nudge)
      } else {
        // Task still not found (might be deleted), keep it pending for now
        stillPending.push(nudge)
      }
    }

    pendingNudges.value = stillPending
  }

  /**
   * Dismiss a nudge notification
   */
  function dismissNudge(nudgeId: string): void {
    const index = activeNudges.value.findIndex(n => n.nudgeId === nudgeId)
    if (index !== -1) {
      activeNudges.value.splice(index, 1)
      
      // Show next nudge in queue after a short delay for better UX
      setTimeout(() => {
        showNextNudge()
      }, 500)
    }
  }

  /**
   * Clear all notifications
   */
  function clearAllNudges(): void {
    activeNudges.value = []
    nudgeQueue.value = []
  }

  // Watch for logout and clear nudges
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        clearAllNudges()
        pendingNudges.value = [] // Clear pending nudges on logout
      }
      // Note: SSE connection is managed by authStore
    }
  )

  // Watch for tasks being loaded and retry pending nudges
  watch(
    () => taskStore.tasks.length,
    (newLength, oldLength) => {
      // If tasks were just loaded (went from 0 to >0), retry pending nudges
      if (oldLength === 0 && newLength > 0 && pendingNudges.value.length > 0) {
        retryPendingNudges()
      }
    }
  )

  // Also watch for when tasks are loaded via initialize (handles case where tasks.length was already > 0)
  watch(
    () => taskStore.isLoading,
    (isLoading, wasLoading) => {
      // If tasks finished loading (isLoading went from true to false), retry pending nudges
      if (wasLoading && !isLoading && pendingNudges.value.length > 0) {
        retryPendingNudges()
      }
    }
  )

  return {
    // State
    activeNudges,
    nudgeQueue,

    // Actions
    handleIncomingNudge, // Export for use by authStore SSE handler
    dismissNudge,
    clearAllNudges,
    showNextNudge,
    retryPendingNudges // Export for manual retry if needed
  }
})

