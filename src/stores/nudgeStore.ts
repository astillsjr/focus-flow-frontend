import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useTaskStore } from './taskStore'
import { getUserNudges, type Nudge } from '../api/nudges'

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
  const eventSource = ref<EventSource | null>(null)
  const useSSE = ref(true)  // Prefer SSE, fallback to polling

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
   * Handle incoming nudge from SSE or polling
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
      console.warn('Task not found for nudge:', nudge.task)
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

    console.log(`✨ Nudge queued: "${task.title}" (${nudgeQueue.value.length} in queue)`)
    showNextNudge()
  }

  /**
   * Check for triggered nudges with messages (polling fallback)
   */
  async function checkForTriggeredNudges(): Promise<void> {
    if (!authStore.accessToken) return

    try {
      // Get triggered nudges with messages
      const triggeredNudges = await getUserNudges(authStore.accessToken, 'triggered', 50)

      // Filter to only nudges with messages (triggeredAt !== null means it was triggered)
      const nudgesWithMessages = triggeredNudges.filter(n => n.triggeredAt !== null && n.message)

      if (nudgesWithMessages.length > 0) {
        console.log(`📬 Found ${nudgesWithMessages.length} triggered nudge(s)`)
      }

      // Process each triggered nudge
      for (const nudge of nudgesWithMessages) {
        handleIncomingNudge(nudge)
      }
      
    } catch (error) {
      console.error('Failed to check triggered nudges:', error)
    }
  }

  /**
   * Start SSE connection for real-time nudge notifications
   */
  function startSSEConnection(): void {
    if (!authStore.accessToken || eventSource.value) {
      return
    }

    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'
      const url = `${API_BASE_URL}/nudges/stream?accessToken=${authStore.accessToken}`
      
      eventSource.value = new EventSource(url)

      eventSource.value.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'connected':
              console.log('✅ Connected to nudge stream')
              // Backlog of missed nudges will be sent automatically
              break
              
            case 'nudge':
              // Handle incoming nudge with backend message
              handleIncomingNudge(data.nudge)
              break
              
            case 'heartbeat':
              // Connection is alive (sent every 30 seconds)
              break
              
            case 'error':
              console.error('SSE error:', data.message)
              // Fallback to polling on error
              stopSSEConnection()
              useSSE.value = false
              startPollingFallback()
              break
          }
        } catch (error) {
          console.error('Error processing SSE message:', error)
        }
      })

      eventSource.value.onerror = (error) => {
        console.error('SSE connection error:', error)
        // Fallback to polling on connection error
        stopSSEConnection()
        useSSE.value = false
        startPollingFallback()
      }

      console.log('📡 Started SSE connection for nudges')
    } catch (error) {
      console.error('Failed to start SSE:', error)
      // Fallback to polling if SSE not supported
      useSSE.value = false
      startPollingFallback()
    }
  }

  /**
   * Stop SSE connection
   */
  function stopSSEConnection(): void {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      console.log('⏸️ Stopped SSE connection')
    }
  }

  /**
   * Start polling fallback (when SSE unavailable or fails)
   */
  function startPollingFallback(intervalMs: number = 60000): void {
    // Stop any existing polling first
    if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }

    isPolling.value = true
    
    // Check immediately for any missed nudges
    checkForTriggeredNudges()

    // Then poll at regular intervals
    pollingInterval.value = window.setInterval(() => {
      checkForTriggeredNudges()
    }, intervalMs)

    console.log(`📡 Started nudge polling fallback (every ${intervalMs / 1000}s)`)
  }

  /**
   * Start nudge notifications (SSE preferred, polling as fallback)
   */
  function startPolling(intervalMs: number = 60000): void {
    if ((isPolling.value && !useSSE.value) || eventSource.value) {
      console.log('⏸️ Nudge notifications already running')
      return
    }

    // Try SSE first if enabled
    if (useSSE.value) {
      startSSEConnection()
    } else {
      // Use polling directly
      startPollingFallback(intervalMs)
    }
  }

  /**
   * Stop all nudge notifications (SSE and polling)
   */
  function stopPolling(): void {
    // Close SSE connection if open
    stopSSEConnection()
    
    // Stop polling if active
    if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
    isPolling.value = false
    console.log('⏸️ Stopped nudge notifications')
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
    checkForTriggeredNudges,
    startPolling,
    stopPolling,
    dismissNudge,
    clearAllNudges,
    showNextNudge
  }
})

