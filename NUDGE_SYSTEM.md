# Automatic Nudge Scheduling System

## Overview

The nudge system automatically reminds users to start their tasks by scheduling and delivering personalized, AI-generated motivational messages. When a user creates a task, the system schedules a nudge that triggers at a specified time to encourage the user to get started.

## How It Works

### 1. **Task Creation → Auto-Schedule Nudge**
When a user creates a task through `TaskForm.vue`, the system:
- Creates the task via the backend API
- Automatically schedules a nudge based on the due date:
  - **With due date**: Schedules at the halfway point between now and the due date
  - **No due date**: Schedules for 5 minutes later
  - **Minimum delay**: Always at least 1 minute in the future
- Logs success or warning if nudge scheduling fails

**Location:** `src/stores/taskStore.ts` → `addTask()` function

### 2. **Background Polling**
The system polls for ready nudges every 60 seconds (configurable):
- Checks the backend for nudges where `deliveryTime` has arrived
- Retrieves task details and recent emotions
- Calls the AI to generate a personalized motivational message
- Adds the nudge to the active notifications queue

**Location:** `src/stores/nudgeStore.ts` → `checkForReadyNudges()` function

### 3. **Notification Display**
When a nudge is ready:
- A notification card appears in the top-right corner
- Displays the task title and AI-generated motivational message
- Provides two actions:
  - **Start Task**: Marks the task as started and dismisses the notification
  - **Dismiss**: Simply removes the notification

**Location:** `src/components/nudges/NudgeNotification.vue`

## Architecture

```
┌─────────────────┐
│  TaskForm.vue   │
│  (User creates  │
│    a task)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  taskStore.addTask()        │
│  1. Create task             │
│  2. Schedule nudge (5 min)  │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend API                │
│  /NudgeEngine/scheduleNudge │
└─────────────────────────────┘
         
         ... 5 minutes pass ...
         
┌─────────────────────────────┐
│  nudgeStore (polling)       │
│  Checks every 60 seconds    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend API                │
│  /NudgeEngine/getReadyNudges│
│  /NudgeEngine/nudgeUser     │
│  (AI generates message)     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  NudgeNotification.vue      │
│  Display notification       │
└─────────────────────────────┘
```

## Files Modified/Created

### Modified Files:
1. **`src/stores/taskStore.ts`**
   - Added import for `scheduleNudge` from nudges API
   - Modified `addTask()` to automatically schedule a nudge after task creation

2. **`src/App.vue`**
   - Added `NudgeNotification` component
   - Initialized nudge polling on app mount
   - Watches for authentication changes to start/stop polling

### Created Files:
1. **`src/stores/nudgeStore.ts`** (NEW)
   - Manages nudge polling lifecycle
   - Stores active nudges
   - Provides actions: `startPolling`, `stopPolling`, `checkForReadyNudges`, `dismissNudge`

2. **`src/components/nudges/NudgeNotification.vue`** (NEW)
   - Displays nudge notifications with animations
   - Handles user actions (Start Task, Dismiss)
   - Positioned top-right corner, responsive design

### Already Implemented:
- **`src/api/nudges.ts`** - All API calls for the NudgeEngine

## Configuration

### Nudge Scheduling Logic

The system uses **smart scheduling** based on task due dates:

- **Task with due date**: Nudge scheduled at the **halfway point** between creation and due date
  - Example: Task due in 2 hours → Nudge in 1 hour
  - Example: Task due in 10 days → Nudge in 5 days
  
- **Task without due date**: Nudge scheduled for **5 minutes** after creation

- **Minimum delay**: All nudges are at least **1 minute** in the future to prevent immediate triggers

### Customize Fallback Timing
Edit `src/stores/taskStore.ts` in the `addTask()` function to change the 5-minute default:

```typescript
// No due date, schedule for 5 minutes from now
deliveryTime = new Date()
deliveryTime.setMinutes(deliveryTime.getMinutes() + 5) // Change '5' to desired minutes
```

### Customize Minimum Delay
Change the minimum delay from 1 minute:

```typescript
// Ensure minimum delay of 1 minute
const minDelay = new Date(now.getTime() + 60000) // Change 60000 (1 min) to desired milliseconds
```

### Customize Polling Interval
Edit `src/App.vue`:

```typescript
nudgeStore.startPolling(60000) // Change to desired milliseconds
// 60000ms = 1 minute
// 30000ms = 30 seconds
// 120000ms = 2 minutes
```

### Advanced Scheduling Options

The system already implements smart scheduling based on due dates. You could further enhance it to:

1. **Different calculation methods:**
```typescript
// Schedule 1 hour before due date instead of halfway
if (payload.dueDate) {
  const dueTime = new Date(payload.dueDate)
  dueTime.setHours(dueTime.getHours() - 1)
  deliveryTime = dueTime
}

// Or schedule at 75% of the time range
const threeFourthsPoint = now.getTime() + (timeDiff * 0.75)
deliveryTime = new Date(threeFourthsPoint)
```

2. **Allow user-configurable nudge times:**
Add a field to `TaskForm.vue` for users to choose when they want to be nudged.

3. **Multiple nudges per task:**
Schedule multiple reminders (e.g., at 75%, 50%, and 25% of time remaining).

## User Experience Flow

1. **User creates a task**
   - Fills out task form with title, description, due date (optional)
   - Clicks "Create Task"

2. **System schedules nudge**
   - **With due date**: Scheduled at the halfway point between now and due date
     - Example: Task due in 4 hours → Nudge in 2 hours
   - **Without due date**: Scheduled for 5 minutes later
   - Minimum 1 minute delay guaranteed
   - No user interaction required

3. **Nudge delivery time arrives**
   - Background polling detects ready nudge
   - AI generates personalized message based on task details
   - Notification appears on screen with slide-in animation

4. **User responds to nudge**
   - Option A: Clicks "Start Task" → Task marked as started, notification dismissed
   - Option B: Clicks "Dismiss" → Notification removed

## API Endpoints Used

- **POST** `/api/NudgeEngine/scheduleNudge` - Schedule a new nudge
- **POST** `/api/NudgeEngine/getReadyNudges` - Get nudges ready for delivery
- **POST** `/api/NudgeEngine/nudgeUser` - Trigger nudge and get AI message
- **POST** `/api/NudgeEngine/cancelNudge` - Cancel a scheduled nudge

## Styling Features

- **Smooth animations**: Slide-in from right, fade transitions
- **Visual hierarchy**: Green accent color, clear typography
- **Hover effects**: Interactive button states
- **Responsive**: Adapts to mobile screens
- **z-index**: 1000 to appear above other content
- **Pointer events**: Notifications don't block underlying content

## Future Enhancements

1. **Browser Notifications**: Use Notification API for system-level alerts
2. **Snooze functionality**: Reschedule nudge for later
3. **Smart scheduling**: Learn user patterns and suggest optimal nudge times
4. **Emotion integration**: Use emotion logs to personalize messages further
5. **Nudge history**: View past nudges and their effectiveness
6. **Customizable messages**: Let users set their own nudge templates
7. **Sound effects**: Optional audio alerts when nudge appears

## Testing the Feature

### Test Scenario 1: Task with Due Date
1. **Create a task** with a due date 10 minutes from now
2. **Check console** for confirmation: "✅ Nudge scheduled successfully for task: [taskId] at [time]"
3. **Expected**: Nudge scheduled for ~5 minutes from now (halfway point)
4. **Wait** for the scheduled time
5. **Observe notification** appearing in top-right corner

### Test Scenario 2: Task without Due Date
1. **Create a task** without setting a due date
2. **Check console** for confirmation
3. **Expected**: Nudge scheduled for 5 minutes from now
4. **Wait 5 minutes**
5. **Observe notification** appearing

### Test Scenario 3: Task with Very Soon Due Date
1. **Create a task** with due date 30 seconds from now
2. **Expected**: Nudge scheduled for 1 minute from now (minimum delay)
3. **Verify** in console log

### Testing Actions
- Click "Start Task" to mark task as started
- Click "Dismiss" to remove notification
- Click "×" to close notification

## Troubleshooting

**Nudges not appearing?**
- Check browser console for polling status
- Verify user is authenticated
- Check backend API connectivity
- Ensure tasks are loaded in taskStore

**Polling not starting?**
- Check if `authStore.isAuthenticated` is true
- Verify `nudgeStore.startPolling()` is called
- Check for console errors

**Multiple notifications appearing?**
- System prevents duplicate notifications by checking active nudges
- Each nudge can only trigger once

---

Built with Vue 3, TypeScript, and Pinia for state management.

