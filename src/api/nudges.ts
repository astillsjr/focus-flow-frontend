// API calls for NudgeEngine

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

// ===== Types =====

export interface Nudge {
  _id: string
  user: string
  task: string
  deliveryTime: Date | string
  triggered: boolean
}

export interface NudgeUserRequest {
  task: string
  title: string
  description: string
  recentEmotions: string[]
}

export interface NudgeUserResponse {
  message: string
  nudge: string
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
 * Schedule a new nudge for a task
 */
export async function scheduleNudge(
  accessToken: string,
  task: string,
  deliveryTime: Date | string
): Promise<{ nudge: string }> {
  const response = await fetch(`${API_BASE_URL}/NudgeEngine/scheduleNudge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task, deliveryTime })
  })
  return handleResponse<{ nudge: string }>(response)
}

/**
 * Cancel (delete) a scheduled nudge
 */
export async function cancelNudge(accessToken: string, task: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/NudgeEngine/cancelNudge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  await handleResponse<{}>(response)
}

/**
 * Delete all nudges associated with a user
 */
export async function deleteUserNudges(accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/NudgeEngine/deleteUserNudges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  await handleResponse<{}>(response)
}

/**
 * Send a motivational nudge to a user
 */
export async function nudgeUser(accessToken: string, request: NudgeUserRequest): Promise<NudgeUserResponse> {
  const response = await fetch(`${API_BASE_URL}/NudgeEngine/nudgeUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, ...request })
  })
  return handleResponse<NudgeUserResponse>(response)
}

/**
 * Get a specific nudge for a given task
 */
export async function getNudge(accessToken: string, task: string): Promise<Nudge> {
  const response = await fetch(`${API_BASE_URL}/NudgeEngine/getNudge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  return handleResponse<Nudge>(response)
}

/**
 * Get all nudges for a user with optional filtering
 */
export async function getUserNudges(
  accessToken: string,
  status?: 'pending' | 'triggered',
  limit?: number
): Promise<Nudge[]> {
  const response = await fetch(`${API_BASE_URL}/NudgeEngine/getUserNudges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, status, limit })
  })
  return handleResponse<Nudge[]>(response)
}

/**
 * Get all ready-to-deliver nudges for a user
 */
export async function getReadyNudges(accessToken: string): Promise<Nudge[]> {
  const response = await fetch(`${API_BASE_URL}/NudgeEngine/getReadyNudges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  return handleResponse<Nudge[]>(response)
}
