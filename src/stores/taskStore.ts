import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

// Note: When copying to src/stores/taskStore.ts, this import path is correct

// TypeScript interfaces
export interface Task {
  _id: string
  user: string
  title: string
  description: string
  createdAt: Date | string
  startedAt?: Date | string
  completedAt?: Date | string
  dueDate?: Date | string
}

export interface CreateTaskPayload {
  title: string
  description: string
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

export interface GetTasksResponse {
  tasks: Task[]
  total: number
  page: number
  totalPages: number
}

// API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

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
      const response = await fetch(`${API_BASE_URL}/TaskManager/getTasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          page: params.page || 1,
          limit: params.limit || 100,
          status: params.status,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || -1
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks')
      }

      const result: GetTasksResponse = data

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
      const response = await fetch(`${API_BASE_URL}/TaskManager/createTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          title: payload.title,
          description: payload.description,
          dueDate: payload.dueDate
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task')
      }

      const taskId: string = data.task

      // Refresh tasks to get the newly created task
      await fetchTasks()

      return taskId
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
      const response = await fetch(`${API_BASE_URL}/TaskManager/updateTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: payload.taskId,
          title: payload.title,
          description: payload.description,
          dueDate: payload.dueDate
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task')
      }

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
      const response = await fetch(`${API_BASE_URL}/TaskManager/deleteTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: taskId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task')
      }

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
      const response = await fetch(`${API_BASE_URL}/TaskManager/markStarted`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: taskId,
          timeStarted: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark task as started')
      }

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
      const response = await fetch(`${API_BASE_URL}/TaskManager/markComplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: authStore.userId,
          task: taskId,
          timeCompleted: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark task as completed')
      }

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