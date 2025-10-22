import type {
  User,
  Task,
  Log,
  Bet,
  Nudge,
  TaskDoc,
  LogDoc,
  BetDoc,
  NudgeDoc,
  AuthResponse,
  EmotionTrends,
  BetResolution,
  CreateTaskParams,
  UpdateTaskParams,
  MarkStartedParams,
  MarkCompleteParams,
  LogBeforeParams,
  LogAfterParams,
  PlaceBetParams,
  ResolveBetParams,
  ScheduleNudgeParams,
  NudgeUserParams,
  RegisterParams,
  LoginParams,
  ChangePasswordParams,
  DeleteAccountParams,
  ApiResponse
} from '@/types/api'

const API_BASE_URL = 'http://localhost:8000'

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiService {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.accessToken = localStorage.getItem('accessToken')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(`Network error: ${error}`)
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
    if (token) {
      localStorage.setItem('accessToken', token)
    } else {
      localStorage.removeItem('accessToken')
    }
  }

  // UserAuthentication API
  async register(params: RegisterParams): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async login(params: LoginParams): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async logout(refreshToken: string): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async changePassword(params: ChangePasswordParams): Promise<void> {
    return this.request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async deleteAccount(params: DeleteAccountParams): Promise<void> {
    return this.request<void>('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify(params),
    })
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  // TaskManager API
  async createTask(params: CreateTaskParams): Promise<{ task: TaskDoc }> {
    return this.request<{ task: TaskDoc }>('/tasks/create', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async updateTask(params: UpdateTaskParams): Promise<{ task: TaskDoc }> {
    return this.request<{ task: TaskDoc }>('/tasks/update', {
      method: 'PUT',
      body: JSON.stringify(params),
    })
  }

  async markStarted(params: MarkStartedParams): Promise<void> {
    return this.request<void>('/tasks/mark-started', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async markComplete(params: MarkCompleteParams): Promise<void> {
    return this.request<void>('/tasks/mark-complete', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async deleteTask(params: { user: User; task: Task }): Promise<void> {
    return this.request<void>('/tasks/delete', {
      method: 'DELETE',
      body: JSON.stringify(params),
    })
  }

  async deleteUserTasks(params: { user: User }): Promise<void> {
    return this.request<void>('/tasks/delete-user-tasks', {
      method: 'DELETE',
      body: JSON.stringify(params),
    })
  }

  async getUserTasks(user: User): Promise<TaskDoc[]> {
    return this.request<TaskDoc[]>(`/tasks/user/${user}`)
  }

  // EmotionLogger API
  async logBefore(params: LogBeforeParams): Promise<{ log: LogDoc }> {
    return this.request<{ log: LogDoc }>('/emotions/log-before', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async logAfter(params: LogAfterParams): Promise<{ log: LogDoc }> {
    return this.request<{ log: LogDoc }>('/emotions/log-after', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async viewEmotionTrends(user: User): Promise<{ trends: EmotionTrends }> {
    return this.request<{ trends: EmotionTrends }>(`/emotions/trends/${user}`)
  }

  async analyzeRecentEmotions(user: User): Promise<{ analysis: string }> {
    return this.request<{ analysis: string }>(`/emotions/analyze/${user}`)
  }

  async deleteTaskLogs(params: { user: User; task: Task }): Promise<void> {
    return this.request<void>('/emotions/delete-task-logs', {
      method: 'DELETE',
      body: JSON.stringify(params),
    })
  }

  async deleteUserLogs(user: User): Promise<void> {
    return this.request<void>(`/emotions/delete-user-logs/${user}`, {
      method: 'DELETE',
    })
  }

  // MicroBet API
  async initializeBettor(user: User): Promise<void> {
    return this.request<void>('/bets/initialize', {
      method: 'POST',
      body: JSON.stringify({ user }),
    })
  }

  async placeBet(params: PlaceBetParams): Promise<{ bet: BetDoc }> {
    return this.request<{ bet: BetDoc }>('/bets/place', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async cancelBet(params: { user: User; task: Task }): Promise<void> {
    return this.request<void>('/bets/cancel', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async resolveBet(params: ResolveBetParams): Promise<BetResolution> {
    return this.request<BetResolution>('/bets/resolve', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async resolveExpiredBet(params: { user: User; task: Task }): Promise<{ status?: string }> {
    return this.request<{ status?: string }>('/bets/resolve-expired', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async viewBetHistory(user: User, status?: 'pending' | 'success' | 'failure'): Promise<BetDoc[]> {
    const query = status ? `?status=${status}` : ''
    return this.request<BetDoc[]>(`/bets/history/${user}${query}`)
  }

  // NudgeEngine API
  async scheduleNudge(params: ScheduleNudgeParams): Promise<{ nudge: NudgeDoc }> {
    return this.request<{ nudge: NudgeDoc }>('/nudges/schedule', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async cancelNudge(params: { user: User; task: Task }): Promise<void> {
    return this.request<void>('/nudges/cancel', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async nudgeUser(params: NudgeUserParams): Promise<{ message: string; nudge: NudgeDoc }> {
    return this.request<{ message: string; nudge: NudgeDoc }>('/nudges/nudge-user', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async deleteUserNudges(user: User): Promise<void> {
    return this.request<void>(`/nudges/delete-user-nudges/${user}`, {
      method: 'DELETE',
    })
  }
}

export const apiService = new ApiService()
export { ApiError }