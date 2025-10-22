# API Specification

Based on the analysis of the concept implementations, here is the comprehensive API specification for the Focus Flow system:

## Overview

The Focus Flow system consists of five core concepts that work together to provide task management, emotional tracking, gamification, and user authentication capabilities.

## Core Concepts

### 1. TaskManager Concept

**Purpose**: To create, organize, and update tasks intended to be completed.

**Core Types**:
- `Task`: ID representing a task
- `TaskStatus`: "pending" | "in-progress" | "completed"
- `User`: ID representing a user

**API Methods**:

#### `createTask(params)`
- **Parameters**: `{ user: User, title: string, description: string, dueDate?: Date }`
- **Returns**: `{ task: Task } | { error: string }`
- **Requirements**: Title must be unique and non-empty. Due date must be in the future.
- **Effects**: Creates a new task for the user.

#### `updateTask(params)`
- **Parameters**: `{ user: User, task: Task, title?: string, description?: string, dueDate?: Date }`
- **Returns**: `{ task: Task } | { error: string }`
- **Requirements**: Task must exist and belong to the user.
- **Effects**: Updates the specified fields of the task.

#### `markStarted(params)`
- **Parameters**: `{ user: User, task: Task, timeStarted: Date }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Task must not already be started. Start time must have passed.
- **Effects**: Marks the task as started.

#### `markComplete(params)`
- **Parameters**: `{ user: User, task: Task, timeCompleted: Date }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Task must not already be completed. Completion time must have passed.
- **Effects**: Marks the task as completed.

#### `deleteTask(params)`
- **Parameters**: `{ user: User, task: Task }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Task must belong to the user.
- **Effects**: Removes the task from the user's tasks.

#### `deleteUserTasks(params)`
- **Parameters**: `{ user: User }`
- **Returns**: `Empty`
- **Effects**: Removes all tasks created by the user.

### 2. EmotionLogger Concept

**Purpose**: To track and analyze user emotions before and after task completion.

**Core Types**:
- `Log`: ID representing an emotion log
- `Phase`: "before" | "after"
- `Emotion`: String representing an emotion type

**API Methods**:

#### `logBefore(params)`
- **Parameters**: `{ user: User, task: Task, emotion: Emotion }`
- **Returns**: `{ log: Log } | { error: string }`
- **Requirements**: No log must exist for this task in the "before" phase.
- **Effects**: Creates a new log entry for the task before completion.

#### `logAfter(params)`
- **Parameters**: `{ user: User, task: Task, emotion: Emotion }`
- **Returns**: `{ log: Log } | { error: string }`
- **Requirements**: No log must exist for this task in the "after" phase.
- **Effects**: Creates a new log entry for the task after completion.

#### `viewEmotionTrends(params)`
- **Parameters**: `{ user: User }`
- **Returns**: `{ trends: { total: number, counts: Partial<Record<Emotion, number>>, byPhase: Record<Phase, Partial<Record<Emotion, number>>>, recentEmotions: { phase: Phase, emotion: Emotion, createdAt: Date }[] } } | { error: string }`
- **Requirements**: User must have at least one log.
- **Effects**: Returns summary statistics of emotion logs.

#### `analyzeRecentEmotions(params)`
- **Parameters**: `{ user: User }`
- **Returns**: `{ analysis: string } | { error: string }`
- **Requirements**: User must have at least one log.
- **Effects**: Generates AI-powered analysis of recent emotional patterns.

#### `deleteTaskLogs(params)`
- **Parameters**: `{ user: User, task: Task }`
- **Returns**: `Empty`
- **Effects**: Removes all logs associated with the task.

#### `deleteUserLogs(params)`
- **Parameters**: `{ user: User }`
- **Returns**: `Empty`
- **Effects**: Removes all emotion logs for the user.

### 3. MicroBet Concept

**Purpose**: To gamify task completion through betting mechanics.

**Core Types**:
- `Bet`: ID representing a bet
- `User`: ID representing a user
- `Task`: ID representing a task

**API Methods**:

#### `initializeBettor(params)`
- **Parameters**: `{ user: User }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: User must not already be initialized.
- **Effects**: Creates a betting profile with 0 points and 0 streak.

#### `placeBet(params)`
- **Parameters**: `{ user: User, task: Task, wager: number, deadline: Date }`
- **Returns**: `{ bet: Bet } | { error: string }`
- **Requirements**: User must have profile, no existing bet for task, sufficient points, deadline in future.
- **Effects**: Creates a bet and deducts wager from user points.

#### `cancelBet(params)`
- **Parameters**: `{ user: User, task: Task }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Bet must exist and belong to user.
- **Effects**: Removes bet and refunds wager if unresolved.

#### `resolveBet(params)`
- **Parameters**: `{ user: User, task: Task, completionTime: Date }`
- **Returns**: `{ status: "already_resolved" | "success", reward?: number } | { error: string }`
- **Requirements**: Bet must exist and belong to user.
- **Effects**: Marks bet as successful, awards points, increases streak.

#### `resolveExpiredBet(params)`
- **Parameters**: `{ user: User, task: Task }`
- **Returns**: `Empty | { status: "already_resolved" } | { error: string }`
- **Requirements**: Bet must exist, belong to user, and deadline must have passed.
- **Effects**: Marks bet as failed and resets streak.

#### `viewBetHistory(params)`
- **Parameters**: `{ user: User, status?: "pending" | "success" | "failure" }`
- **Returns**: `BetDoc[] | { error: string }`
- **Requirements**: User must have betting profile.
- **Effects**: Returns filtered bet history.

### 4. NudgeEngine Concept

**Purpose**: To generate personalized, context-aware motivational nudges using AI.

**Core Types**:
- `Nudge`: ID representing a nudge
- `User`: ID representing a user
- `Task`: ID representing a task

**API Methods**:

#### `scheduleNudge(params)`
- **Parameters**: `{ user: User, task: Task, deliveryTime: Date }`
- **Returns**: `{ nudge: Nudge } | { error: string }`
- **Requirements**: No nudge must exist for task, delivery time must be in future.
- **Effects**: Creates a new nudge scheduled for delivery.

#### `cancelNudge(params)`
- **Parameters**: `{ user: User, task: Task }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Nudge must exist and not be triggered or canceled.
- **Effects**: Marks the nudge as canceled.

#### `nudgeUser(params)`
- **Parameters**: `{ user: User, task: Task, title: string, description: string, recentEmotions: Emotion[] }`
- **Returns**: `{ message: string, nudge: Nudge } | { error: string }`
- **Requirements**: Nudge must be ready for delivery.
- **Effects**: Generates and delivers motivational message, marks nudge as triggered.

#### `deleteUserNudges(params)`
- **Parameters**: `{ user: User }`
- **Returns**: `Empty`
- **Effects**: Removes all nudges for the user.

### 5. UserAuthentication Concept

**Purpose**: To authenticate users and protect data with secure identity management.

**Core Types**:
- `User`: ID representing a user

**API Methods**:

#### `register(params)`
- **Parameters**: `{ username: string, password: string, email: string }`
- **Returns**: `{ accessToken: string, refreshToken: string } | { error: string }`
- **Requirements**: Username and email must be unique, email must be valid format.
- **Effects**: Creates new user account and returns session tokens.

#### `login(params)`
- **Parameters**: `{ username: string, password: string }`
- **Returns**: `{ accessToken: string, refreshToken: string } | { error: string }`
- **Requirements**: User must exist with matching credentials.
- **Effects**: Returns session tokens for authenticated user.

#### `logout(refreshToken)`
- **Parameters**: `refreshToken: string`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Refresh token must be valid.
- **Effects**: Invalidates the user's refresh token.

#### `changePassword(params)`
- **Parameters**: `{ accessToken: string, oldPassword: string, newPassword: string }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Access token must be valid, old password must match.
- **Effects**: Updates user's password.

#### `deleteAccount(params)`
- **Parameters**: `{ accessToken: string, password: string }`
- **Returns**: `Empty | { error: string }`
- **Requirements**: Access token must be valid, password must match.
- **Effects**: Deletes the user account.

#### `refreshAccessToken(refreshToken)`
- **Parameters**: `refreshToken: string`
- **Returns**: `{ accessToken: string } | { error: string }`
- **Requirements**: Refresh token must be valid.
- **Effects**: Generates new access token.

## Data Models

### TaskDoc
```typescript
interface TaskDoc {
  _id: Task;
  user: User;
  title: string;
  description: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
}
```

### LogDoc
```typescript
interface LogDoc {
  _id: Log;
  user: User;
  task: Task;
  phase: Phase;
  emotion: Emotion;
  createdAt: Date;
}
```

### BetDoc
```typescript
interface BetDoc {
  _id: Bet;
  user: User;
  task: Task;
  wager: number;
  deadline: Date;
  success?: boolean;
  createdAt: Date;
}
```

### NudgeDoc
```typescript
interface NudgeDoc {
  _id: Nudge;
  user: User;
  task: Task;
  deliveryTime: Date;
  triggered: boolean;
  canceled: boolean;
}
```

### UserDoc (Authentication)
```typescript
interface UserDoc {
  _id: User;
  username: string;
  hashedPassword: string;
  email: string;
  createdAt: Date;
  refreshToken?: string;
}
```

## Error Handling

All API methods return either a success result or an error object with a descriptive message. Common error patterns include:

- **Validation errors**: Invalid input parameters
- **Authorization errors**: Insufficient permissions or invalid tokens
- **Not found errors**: Requested resources don't exist
- **Conflict errors**: Duplicate resources or constraint violations
- **Business logic errors**: Operations that violate business rules

## Integration Notes

The concepts are designed to work together:

1. **UserAuthentication** provides user identity for all other concepts
2. **TaskManager** creates tasks that can be tracked by other concepts
3. **EmotionLogger** tracks emotions related to tasks
4. **MicroBet** gamifies task completion
5. **NudgeEngine** provides motivational support using emotion data

Each concept maintains its own data collections with prefixed names to avoid conflicts, and all operations are scoped to specific users for security and data isolation.