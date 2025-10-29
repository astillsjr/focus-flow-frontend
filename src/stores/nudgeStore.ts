import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useTaskStore } from './taskStore'
import { getReadyNudges, nudgeUser } from '../api/nudges'

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
  const isPolling = ref(false)
  const pollingInterval = ref<number | null>(null)

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
        console.log(`📢 Showing next nudge from queue: "${nextNudge.taskTitle}" (${nudgeQueue.value.length} remaining)`)
      }
    }
  }

  /**
   * Check for ready nudges and trigger them
   */
  async function checkForReadyNudges(): Promise<void> {
    if (!authStore.userId) return

    try {
      // Get all ready-to-deliver nudges
      const readyNudges = await getReadyNudges(authStore.userId)

      if (readyNudges.length > 0) {
        console.log(`📬 Found ${readyNudges.length} ready nudge(s)`)
      }

      // Process each ready nudge
      for (const nudge of readyNudges) {
        // Check if this nudge is already in queue or active
        const alreadyQueued = nudgeQueue.value.some(n => n.taskId === nudge.task)
        const alreadyActive = activeNudges.value.some(n => n.taskId === nudge.task)
        
        if (alreadyQueued || alreadyActive) {
          continue
        }

        // Get the task details
        const task = taskStore.getTaskById(nudge.task)
        if (!task) {
          console.warn('Task not found for nudge:', nudge.task)
          continue
        }

        // Get recent emotions (you can enhance this to actually fetch from emotion store)
        const recentEmotions: string[] = []

        try {
          // Call nudgeUser to get the AI-generated message
          const result = await nudgeUser({
            user: authStore.userId,
            task: nudge.task,
            title: task.title,
            description: task.description || '',
            recentEmotions
          })

          // Add to queue instead of directly to active nudges
          nudgeQueue.value.push({
            nudgeId: result.nudge,
            taskId: nudge.task,
            taskTitle: task.title,
            message: result.message,
            timestamp: new Date()
          })

          console.log(`✨ Nudge queued: "${task.title}" (${nudgeQueue.value.length} in queue)`)
        } catch (error) {
          console.error('Failed to trigger nudge:', error)
        }
      }
      
      // Show the first nudge if none are currently active
      showNextNudge()
      
    } catch (error) {
      console.error('Failed to check ready nudges:', error)
    }
  }

  /**
   * Start polling for ready nudges
   */
  function startPolling(intervalMs: number = 60000): void {
    if (isPolling.value) {
      console.log('⏸️ Nudge polling already running')
      return
    }

    isPolling.value = true
    
    // Check immediately
    checkForReadyNudges()

    // Then poll at regular intervals
    pollingInterval.value = window.setInterval(() => {
      checkForReadyNudges()
    }, intervalMs)

    console.log(`📡 Started nudge polling (every ${intervalMs / 1000}s)`)
  }

  /**
   * Stop polling
   */
  function stopPolling(): void {
    if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
    isPolling.value = false
    console.log('⏸️ Stopped nudge polling')
  }

  /**
   * Dismiss a nudge notification
   */
  function dismissNudge(nudgeId: string): void {
    const index = activeNudges.value.findIndex(n => n.nudgeId === nudgeId)
    if (index !== -1) {
      const nudge = activeNudges.value[index]
      console.log('🔕 Dismissed nudge for task:', nudge.taskTitle)
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
    console.log('🔕 Cleared all nudges and queue')
  }

  // Watch for logout and stop polling
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        stopPolling()
        clearAllNudges()
      } else {
        // Start polling when user logs in
        startPolling()
      }
    }
  )

  return {
    // State
    activeNudges,
    nudgeQueue,
    isPolling,

    // Actions
    checkForReadyNudges,
    startPolling,
    stopPolling,
    dismissNudge,
    clearAllNudges,
    showNextNudge
  }
})

