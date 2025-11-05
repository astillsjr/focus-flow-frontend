// API calls for NudgeEngine

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

// ===== Types =====

export interface Nudge {
  _id: string
  user: string
  task: string
  deliveryTime: Date | string
  triggeredAt: Date | string | null  // When the nudge was actually triggered (null if not yet triggered)
  createdAt: Date | string
  message?: string  // AI-generated message when triggered
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

