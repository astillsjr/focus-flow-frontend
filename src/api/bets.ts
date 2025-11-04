// API calls for MicroBet

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

// ===== Types =====

export interface Bet {
  _id: string
  user: string
  task: string
  wager: number
  deadline: Date | string
  taskDueDate?: Date | string
  success?: boolean
  createdAt: Date | string
}

export interface PlaceBetRequest {
  task: string
  wager: number
  deadline: Date | string
  taskDueDate?: Date | string
}

export interface UserProfile {
  points: number
  streak: number
  totalBets: number
  successfulBets: number
  failedBets: number
  pendingBets: number
}

export interface ResolveBetResponse {
  status: 'already_resolved' | 'success'
  reward?: number
}

export interface ResolveExpiredBetResponse {
  status?: 'already_resolved'
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
 * Initialize a user in the betting system
 */
export async function initializeBettor(accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/initializeBettor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  await handleResponse<{}>(response)
}

/**
 * Remove a user and their bets from the system
 */
export async function removeBettor(accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/removeBettor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  await handleResponse<{}>(response)
}

/**
 * Place a new bet on a task
 */
export async function placeBet(accessToken: string, request: PlaceBetRequest): Promise<{ bet: string }> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/placeBet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, ...request })
  })
  return handleResponse<{ bet: string }>(response)
}

/**
 * Cancel an existing bet
 */
export async function cancelBet(accessToken: string, task: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/cancelBet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  await handleResponse<{}>(response)
}

/**
 * Resolve a bet when a task is completed
 */
export async function resolveBet(
  accessToken: string,
  task: string,
  completionTime: Date | string
): Promise<ResolveBetResponse> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/resolveBet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task, completionTime })
  })
  return handleResponse<ResolveBetResponse>(response)
}

/**
 * Resolve a bet that has passed its deadline
 */
export async function resolveExpiredBet(accessToken: string, task: string): Promise<ResolveExpiredBetResponse> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/resolveExpiredBet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  return handleResponse<ResolveExpiredBetResponse>(response)
}

/**
 * Get a specific bet for a user
 */
export async function getBet(accessToken: string, task: string): Promise<Bet> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/getBet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, task })
  })
  return handleResponse<Bet>(response)
}

/**
 * Get all active (unresolved) bets for a user
 */
export async function getActiveBets(accessToken: string): Promise<Bet[]> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/getActiveBets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  return handleResponse<Bet[]>(response)
}

/**
 * Get all expired (unresolved and past-deadline) bets for a user
 */
export async function getExpiredBets(accessToken: string): Promise<Bet[]> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/getExpiredBets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  return handleResponse<Bet[]>(response)
}

/**
 * Get the user's overall betting profile and statistics
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/getUserProfile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  return handleResponse<UserProfile>(response)
}

/**
 * Get recent betting activity for a user
 */
export async function getRecentActivity(accessToken: string, limit?: number): Promise<Bet[]> {
  const response = await fetch(`${API_BASE_URL}/MicroBet/getRecentActivity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, limit })
  })
  return handleResponse<Bet[]>(response)
}
