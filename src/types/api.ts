// Core types from API specification
export type User = string
export type Task = string
export type Log = string
export type Bet = string
export type Nudge = string

export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type Phase = 'before' | 'after'
export type Emotion = string
export type BetStatus = 'pending' | 'success' | 'failure'

// Data model interfaces
export interface TaskDoc {
  _id: Task
  user: User
  title: string
  description: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  dueDate?: Date
}

export interface LogDoc {
  _id: Log
  user: User
  task: Task
  phase: Phase
  emotion: Emotion
  createdAt: Date
}

export interface BetDoc {
  _id: Bet
  user: User
  task: Task
  wager: number
  deadline: Date
  success?: boolean
  createdAt: Date
}

export interface NudgeDoc {
  _id: Nudge
  user: User
  task: Task
  deliveryTime: Date
  triggered: boolean
  canceled: boolean
}

export interface UserDoc {
  _id: User
  username: string
  hashedPassword: string
  email: string
  createdAt: Date
  refreshToken?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface EmotionTrends {
  total: number
  counts: Partial<Record<Emotion, number>>
  byPhase: Record<Phase, Partial<Record<Emotion, number>>>
  recentEmotions: {
    phase: Phase
    emotion: Emotion
    createdAt: Date
  }[]
}

export interface BetResolution {
  status: 'already_resolved' | 'success'
  reward?: number
}

// API Request types
export interface CreateTaskParams {
  user: User
  title: string
  description: string
  dueDate?: Date
}

export interface UpdateTaskParams {
  user: User
  task: Task
  title?: string
  description?: string
  dueDate?: Date
}

export interface MarkStartedParams {
  user: User
  task: Task
  timeStarted: Date
}

export interface MarkCompleteParams {
  user: User
  task: Task
  timeCompleted: Date
}

export interface LogBeforeParams {
  user: User
  task: Task
  emotion: Emotion
}

export interface LogAfterParams {
  user: User
  task: Task
  emotion: Emotion
}

export interface PlaceBetParams {
  user: User
  task: Task
  wager: number
  deadline: Date
}

export interface ResolveBetParams {
  user: User
  task: Task
  completionTime: Date
}

export interface ScheduleNudgeParams {
  user: User
  task: Task
  deliveryTime: Date
}

export interface NudgeUserParams {
  user: User
  task: Task
  title: string
  description: string
  recentEmotions: Emotion[]
}

export interface RegisterParams {
  username: string
  password: string
  email: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface ChangePasswordParams {
  accessToken: string
  oldPassword: string
  newPassword: string
}

export interface DeleteAccountParams {
  accessToken: string
  password: string
}