// API calls for EmotionLogger

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

// ===== Types =====

export interface EmotionLog {
  _id: string
  user: string
  task: string
  phase: 'before' | 'after'
  emotion: string
  createdAt: Date | string
}

export interface TaskEmotions {
  task: string
  emotions: {
    before?: string
    after?: string
  }
}

export interface GetEmotionLogsRequest {
  page?: number
  limit?: number
  phase?: 'before' | 'after'
  emotion?: string
  sortBy?: string
  sortOrder?: 1 | -1
}

export interface GetEmotionLogsResponse {
  logs: EmotionLog[]
  total: number
  page: number
  totalPages: number
}

export interface EmotionStats {
  totalLogs: number
  mostCommonEmotion: string | null
  leastCommonEmotion: string | null
  averageEmotionsPerDay: number
  recentTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
}

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
 * Log an emotion for a task before it is completed
 */
export async function logBefore(accessToken: string, task: string, emotion: string): Promise<{ log: string }> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/logBefore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task, emotion })
  })
  return handleResponse<{ log: string }>(response)
}

/**
 * Log an emotion for a task after it is completed
 */
export async function logAfter(accessToken: string, task: string, emotion: string): Promise<{ log: string }> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/logAfter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task, emotion })
  })
  return handleResponse<{ log: string }>(response)
}

/**
 * Delete all emotion logs for a specific task
 */
export async function deleteTaskLogs(accessToken: string, task: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/deleteTaskLogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  await handleResponse<{}>(response)
}

/**
 * Delete all emotion logs for a specific user
 */
export async function deleteUserLogs(accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/deleteUserLogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  await handleResponse<{}>(response)
}

/**
 * Generate a reflection analyzing the user's recent emotional patterns
 */
export async function analyzeRecentEmotions(accessToken: string): Promise<{ analysis: string }> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/analyzeRecentEmotions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  return handleResponse<{ analysis: string }>(response)
}

/**
 * Get all logged emotions for a specific task
 */
export async function getEmotionsForTask(accessToken: string, task: string): Promise<TaskEmotions> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/getEmotionsForTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  return handleResponse<TaskEmotions>(response)
}

/**
 * Get emotion logs with pagination and filtering
 */
export async function getEmotionLogs(accessToken: string, request: GetEmotionLogsRequest): Promise<GetEmotionLogsResponse> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/getEmotionLogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, ...request })
  })
  return handleResponse<GetEmotionLogsResponse>(response)
}

/**
 * Get overall emotion statistics for a user
 */
export async function getEmotionStats(accessToken: string): Promise<EmotionStats> {
  const response = await fetch(`${API_BASE_URL}/EmotionLogger/getEmotionStats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  return handleResponse<EmotionStats>(response)
}
