// API calls for TaskManager

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

// ===== Types =====

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

export interface CreateTaskRequest {
  title: string
  description?: string
  dueDate?: Date | string | null
}

export interface UpdateTaskRequest {
  task: string
  title?: string
  description?: string
  dueDate?: Date | string | null
}

export interface GetTasksRequest {
  page?: number | null
  limit?: number | null
  status?: 'pending' | 'in-progress' | 'completed' | null
  search?: string | null
  sortBy?: string | null
  sortOrder?: 1 | -1 | null
}

export interface GetTasksResponse {
  tasks: Task[]
  total: number
  page: number
  totalPages: number
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed'

// ===== Helper Functions =====

/**
 * Helper to handle API responses consistently
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }
  
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(data.error || 'API returned an error')
  }
  
  return data as T
}

// ===== API Functions =====

/**
 * Create a new task
 */
export async function createTask(accessToken: string, request: CreateTaskRequest): Promise<{ task: string }> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, ...request })
  })
  return handleResponse<{ task: string }>(response)
}

/**
 * Update an existing task
 */
export async function updateTask(accessToken: string, request: UpdateTaskRequest): Promise<{ task: string }> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/updateTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accessToken,
      task: request.task,
      title: request.title ?? null,
      description: request.description ?? null,
      dueDate: request.dueDate ?? null
    })
  })
  return handleResponse<{ task: string }>(response)
}

/**
 * Mark a task as started
 */
export async function markStarted(accessToken: string, task: string, timeStarted: Date | string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/markStarted`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task, timeStarted })
  })
  await handleResponse<{}>(response)
}

/**
 * Mark a task as completed
 */
export async function markComplete(accessToken: string, task: string, timeCompleted: Date | string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/markComplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task, timeCompleted })
  })
  await handleResponse<{}>(response)
}

/**
 * Delete a single task
 */
export async function deleteTask(accessToken: string, task: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/deleteTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  await handleResponse<{}>(response)
}

/**
 * Delete all tasks for a user
 */
export async function deleteUserTasks(accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/deleteUserTasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  await handleResponse<{}>(response)
}

/**
 * Get a single task by ID
 */
export async function getTask(accessToken: string, task: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/getTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  const data = await handleResponse<{ task: Task }>(response)
  return data.task
}

/**
 * Get a paginated and filtered list of tasks
 */
export async function getTasks(accessToken: string, request: GetTasksRequest = {}): Promise<GetTasksResponse> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/getTasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accessToken,
      page: request.page ?? null,
      limit: request.limit ?? null,
      sortBy: request.sortBy ?? null,
      sortOrder: request.sortOrder ?? null,
      status: request.status ?? null,
      search: request.search ?? null
    })
  })
  return handleResponse<GetTasksResponse>(response)
}

/**
 * Get the status of a task
 */
export async function getTaskStatus(accessToken: string, taskId: string): Promise<{ status: TaskStatus }> {
  const response = await fetch(`${API_BASE_URL}/TaskManager/getTaskStatus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task: taskId })
  })
  return handleResponse<{ status: TaskStatus }>(response)
}
