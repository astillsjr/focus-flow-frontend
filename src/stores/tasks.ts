import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, ApiError } from '@/services/api'
import { useAuthStore } from './auth'
import type { TaskDoc, CreateTaskParams, UpdateTaskParams, MarkStartedParams, MarkCompleteParams } from '@/types/api'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<TaskDoc[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pendingTasks = computed(() => 
    tasks.value.filter(task => !task.startedAt && !task.completedAt)
  )
  
  const inProgressTasks = computed(() => 
    tasks.value.filter(task => task.startedAt && !task.completedAt)
  )
  
  const completedTasks = computed(() => 
    tasks.value.filter(task => task.completedAt)
  )
  
  const overdueTasks = computed(() => 
    tasks.value.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < new Date() && 
      !task.completedAt
    )
  )

  const getTaskById = computed(() => (id: string) => 
    tasks.value.find(task => task._id === id)
  )

  // Actions
  const setError = (message: string) => {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  const fetchUserTasks = async (): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const userTasks = await apiService.getUserTasks(authStore.user)
      tasks.value = userTasks
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch tasks'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (params: Omit<CreateTaskParams, 'user'>): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.createTask({
        ...params,
        user: authStore.user
      })
      
      tasks.value.push(response.task)
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create task'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateTask = async (taskId: string, updates: Omit<UpdateTaskParams, 'user' | 'task'>): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.updateTask({
        ...updates,
        user: authStore.user,
        task: taskId
      })
      
      const index = tasks.value.findIndex(task => task._id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.task
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update task'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const markTaskStarted = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.markStarted({
        user: authStore.user,
        task: taskId,
        timeStarted: new Date()
      })
      
      const task = tasks.value.find(t => t._id === taskId)
      if (task) {
        task.startedAt = new Date()
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to start task'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const markTaskComplete = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.markComplete({
        user: authStore.user,
        task: taskId,
        timeCompleted: new Date()
      })
      
      const task = tasks.value.find(t => t._id === taskId)
      if (task) {
        task.completedAt = new Date()
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to complete task'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteTask = async (taskId: string): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteTask({
        user: authStore.user,
        task: taskId
      })
      
      tasks.value = tasks.value.filter(task => task._id !== taskId)
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete task'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteAllUserTasks = async (): Promise<boolean> => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      setError('User not authenticated')
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      await apiService.deleteUserTasks({
        user: authStore.user
      })
      
      tasks.value = []
      return true
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete all tasks'
      setError(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const clearTasks = () => {
    tasks.value = []
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
    overdueTasks,
    getTaskById,
    
    // Actions
    fetchUserTasks,
    createTask,
    updateTask,
    markTaskStarted,
    markTaskComplete,
    deleteTask,
    deleteAllUserTasks,
    clearTasks
  }
})