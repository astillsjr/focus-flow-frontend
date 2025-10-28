import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { scheduleNudge } from '../api/nudges'
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await taskAPI.getTasks({
        user: authStore.userId,
        page: params.page || 1,
        limit: params.limit || 100,
        status: params.status,
        search: params.search,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || -1
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await taskAPI.createTask({
        user: authStore.userId,
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate
      })

      // ✨ Automatically schedule a nudge for the new task
      try {
        let deliveryTime: Date
        
        if (payload.dueDate) {
          // Calculate halfway point between now and due date
          const now = new Date()
          const dueDate = new Date(payload.dueDate)
          const timeDiff = dueDate.getTime() - now.getTime()
          
          if (timeDiff > 0) {
            // Schedule at the halfway point
            const halfwayPoint = now.getTime() + (timeDiff / 2)
            deliveryTime = new Date(halfwayPoint)
            
            // Ensure minimum delay of 1 minute
            const minDelay = new Date(now.getTime() + 60000) // 1 minute
            if (deliveryTime < minDelay) {
              deliveryTime = minDelay
            }
          } else {
            // Due date is in the past, schedule for 5 minutes from now
            deliveryTime = new Date()
            deliveryTime.setMinutes(deliveryTime.getMinutes() + 5)
          }
        } else {
          // No due date, schedule for 5 minutes from now
          deliveryTime = new Date()
          deliveryTime.setMinutes(deliveryTime.getMinutes() + 5)
        }
        
        await scheduleNudge(authStore.userId, data.task, deliveryTime.toISOString())
        
        console.log('✅ Nudge scheduled successfully for task:', data.task, 'at', deliveryTime.toISOString())
      } catch (nudgeError) {
        // Don't fail task creation if nudge scheduling fails
        console.warn('⚠️ Failed to schedule nudge:', nudgeError)
      }

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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await taskAPI.updateTask({
        user: authStore.userId,
        task: payload.taskId,
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await taskAPI.deleteTask(authStore.userId, taskId)

      // Remove task from local state
      tasks.value = tasks.value.filter(task => task._id !== taskId)
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await taskAPI.markStarted(authStore.userId, taskId, new Date().toISOString())

      // Update task in local state
      const taskIndex = tasks.value.findIndex(t => t._id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].startedAt = new Date().toISOString()
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
    if (!authStore.userId) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    error.value = null

    try {
      await taskAPI.markComplete(authStore.userId, taskId, new Date().toISOString())

      // Update task in local state
      const taskIndex = tasks.value.findIndex(t => t._id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].completedAt = new Date().toISOString()
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