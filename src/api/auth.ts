// API calls for authentication (login, register, refresh token, getUserInfo)

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

// ===== Types =====

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  password: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface UserInfo {
  id: string
  username: string
  email: string
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
  
  // Check if the response contains an error field even with 200 status
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(data.error || 'API returned an error')
  }
  
  return data as T
}

// ===== API Functions =====

/**
 * Register a new user
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/UserAuthentication/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
  return handleResponse<AuthResponse>(response)
}

/**
 * Login an existing user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/UserAuthentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
  return handleResponse<AuthResponse>(response)
}

/**
 * Logout a user
 */
export async function logout(refreshToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/UserAuthentication/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  })
  await handleResponse<{}>(response)
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const response = await fetch(`${API_BASE_URL}/UserAuthentication/refreshAccessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  })
  return handleResponse<{ accessToken: string }>(response)
}

/**
 * Fetch user information using the access token
 */
export async function getUserInfo(accessToken: string): Promise<{ user: UserInfo }> {
  const response = await fetch(`${API_BASE_URL}/UserAuthentication/getUserInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken })
  })
  return handleResponse<{ user: UserInfo }>(response)
}

/**
 * Change a user's password
 */
export async function changePassword(
  accessToken: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/UserAuthentication/changePassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, oldPassword, newPassword })
  })
  await handleResponse<{}>(response)
}

/**
 * Delete a user's account
 */
export async function deleteAccount(accessToken: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/UserAuthentication/deleteAccount`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessToken, password })
  })
  await handleResponse<{}>(response)
}
