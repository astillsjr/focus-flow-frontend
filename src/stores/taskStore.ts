import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useBetStore } from './betStore'
import * as taskAPI from '@/api/tasks'
import type { Task } from '@/api/tasks'

// Re-export Task type for convenience
export type { Task }

// Local interfaces for store-specific payloads
export interface CreateTaskPayload {
  title: string
  description?: string
  dueDate?: Date | string
}

export interface UpdateTaskPayload {
  taskId: string
  title?: string
  description?: string
  dueDate?: Date | string
}

export interface GetTasksParams {
  page?: number
  limit?: number
  status?: 'pending' | 'in-progress' | 'completed'
  search?: string
  sortBy?: string
  sortOrder?: 1 | -1
}

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get auth store
  const authStore = useAuthStore()

  // Getters
  const pendingTasks = computed(() => {
    return tasks.value.filter(task => !task.startedAt && !task.completedAt)
  })

  const inProgressTasks = computed(() => {
    return tasks.value.filter(task => task.startedAt && !task.completedAt)
  })

  const completedTasks = computed(() => {
    return tasks.value.filter(task => task.completedAt)
  })

  const taskCount = computed(() => ({
    total: tasks.value.length,
    pending: pendingTasks.value.length,
    inProgress: inProgressTasks.value.length,
    completed: completedTasks.value.length
  }))

  // Actions

  /**
   * Fetch tasks from the API
   */
  async function fetchTasks(params: GetTasksParams = {}): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await taskAPI.getTasks(authStore.accessToken, {
        page: params.page ?? null,
        limit: params.limit ?? null,
        sortBy: params.sortBy ?? null,
        sortOrder: params.sortOrder ?? null,
        status: params.status ?? null,
        search: params.search ?? null
      })

      // Update tasks in store
      tasks.value = result.tasks
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
      console.error('Fetch tasks error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new task
   */
  async function addTask(payload: CreateTaskPayload): Promise<string> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await taskAPI.createTask(authStore.accessToken, {
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate ?? null
      })

      // Backend automatically schedules a nudge when task is created

      // Refresh tasks to get the newly created task
      await fetchTasks()

      return data.task
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create task'
      console.error('Create task error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing task
   */
  async function updateTask(payload: UpdateTaskPayload): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await taskAPI.updateTask(authStore.accessToken, {
        task: payload.taskId,
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate ?? null
      })

      // Refresh tasks to get updated data
      await fetchTasks()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update task'
      console.error('Update task error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a task
   */
  async function deleteTask(taskId: string): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      // Backend automatically cascades deletion of associated bet, nudge, and emotion logs
      await taskAPI.deleteTask(authStore.accessToken, taskId)

      // Remove task from local state
      tasks.value = tasks.value.filter(task => task._id !== taskId)

      // Refresh bet store to update profile stats (points, bet counts, etc.)
      // This handles the case where a bet was refunded due to task deletion
      const betStore = useBetStore()
      if (betStore.isInitialized) {
        try {
          // Refresh profile and active bets to get updated stats after refund
          await Promise.all([
            betStore.fetchProfile(),
            betStore.fetchActiveBets()
          ])
        } catch (err) {
          // Log error but don't fail task deletion if bet refresh fails
          console.error('Failed to refresh bet store after task deletion:', err)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete task'
      console.error('Delete task error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a task as started
   */
  async function markStarted(taskId: string): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const startTime = new Date().toISOString()
      await taskAPI.markStarted(authStore.accessToken, taskId, startTime)

      // Backend automatically resolves any associated bet and cancels any scheduled nudge

      // Update task in local state
      const taskIndex = tasks.value.findIndex(t => t._id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].startedAt = startTime
      }

      // Refresh bet store to update profile stats (points, bet counts, etc.)
      // This handles the case where a bet was resolved when the task started
      const betStore = useBetStore()
      if (betStore.isInitialized) {
        try {
          // Refresh profile and active bets to get updated stats
          await Promise.all([
            betStore.fetchProfile(),
            betStore.fetchActiveBets()
          ])
        } catch (err) {
          // Log error but don't fail task start if bet refresh fails
          console.error('Failed to refresh bet store after task start:', err)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark task as started'
      console.error('Mark started error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a task as completed
   */
  async function markCompleted(taskId: string): Promise<void> {
    if (!authStore.accessToken) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await taskAPI.markComplete(authStore.accessToken, taskId, new Date().toISOString())

      // Backend automatically resolves any associated bet and cancels any scheduled nudge

      // Update task in local state
      const taskIndex = tasks.value.findIndex(t => t._id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].completedAt = new Date().toISOString()
      }

      // Refresh bet store to update profile stats (points, bet counts, etc.)
      // This handles the case where a bet was resolved when the task completed
      const betStore = useBetStore()
      if (betStore.isInitialized) {
        try {
          // Refresh profile and active bets to get updated stats
          await Promise.all([
            betStore.fetchProfile(),
            betStore.fetchActiveBets()
          ])
        } catch (err) {
          // Log error but don't fail task completion if bet refresh fails
          console.error('Failed to refresh bet store after task completion:', err)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark task as completed'
      console.error('Mark completed error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get task status
   */
  function getTaskStatus(task: Task): 'pending' | 'in-progress' | 'completed' {
    if (task.completedAt) return 'completed'
    if (task.startedAt) return 'in-progress'
    return 'pending'
  }

  /**
   * Find a task by ID
   */
  function getTaskById(taskId: string): Task | undefined {
    return tasks.value.find(task => task._id === taskId)
  }

  /**
   * Clear all tasks (used on logout)
   */
  function clearTasks(): void {
    tasks.value = []
    error.value = null
    isLoading.value = false
  }

  /**
   * Initialize tasks for the current user
   */
  async function initialize(): Promise<void> {
    if (authStore.isAuthenticated) {
      try {
        await fetchTasks()
      } catch (err) {
        console.error('Failed to initialize tasks:', err)
      }
    }
  }

  // Watch for logout and clear tasks automatically
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        clearTasks()
      }
    }
  )

  return {
    // State
    tasks,
    isLoading,
    error,

    // Getters
    pendingTasks,
    inProgressTasks,
    completedTasks,
    taskCount,

    // Actions
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    markStarted,
    markCompleted,
    getTaskStatus,
    getTaskById,
    clearTasks,
    initialize
  }
})