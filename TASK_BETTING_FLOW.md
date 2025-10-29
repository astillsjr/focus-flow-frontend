# Task Creation with Optional Betting Flow

## Overview
This document describes the new task creation flow that integrates optional betting functionality.

## Implementation

### New Component: TaskCreationFlow.vue
Located at: `src/components/tasks/TaskCreationFlow.vue`

This component implements a multi-step flow for creating tasks with optional betting:

#### Step 1: Create Task
- User fills out the task form (title, description, due date)
- Upon submission, the task is created in the database
- Flow automatically moves to Step 2

#### Step 2: Bet Prompt
- User is asked if they want to place a bet on the newly created task
- Shows the task title that was just created
- If user doesn't have a betting profile, they can initialize it here
- Options:
  - **"Yes, Place a Bet"** → Proceeds to Step 3
  - **"Skip for Now"** → Proceeds to Step 4 (completion)

#### Step 3: Bet Form (if user chooses to bet)
- Shows the bet form pre-configured with the task ID and title
- User sets:
  - Wager amount (points to bet)
  - Deadline (when they commit to complete the task)
  - Optional: Task due date
- Shows bet summary with potential rewards
- Option to skip betting if they change their mind

#### Step 4: Completion
- Success message showing task created (and bet placed if applicable)
- Options:
  - **"View Dashboard"** → Returns to task dashboard
  - **"Create Another Task"** → Restarts the flow

## Changes Made

### 1. New Files
- **src/components/tasks/TaskCreationFlow.vue**: Main flow component

### 2. Modified Files

#### src/components/tasks/TaskForm.vue
- Added `showTitle` prop (default: true) to optionally hide the h2 title
- This allows the form to be embedded in the flow with custom headers

#### src/router/index.ts
- Added new route: `/tasks/create` → TaskCreationFlow component
- Requires authentication

#### src/components/tasks/TasksDashboard.vue
- Changed "Create New Task" button to navigate to `/tasks/create` instead of showing modal
- Removed modal-related code and styles
- Simplified component structure

## User Experience

### Flow Diagram
```
[Dashboard] 
    ↓ (Click "Create New Task")
[Create Task Form]
    ↓ (Submit)
[Bet Prompt: "Want to bet?"]
    ↓ Yes          ↓ No
[Bet Form]    [Success Screen]
    ↓
[Success Screen]
    ↓
[Dashboard or Create Another]
```

## Features

### Visual Design
- Beautiful gradient background
- Smooth animations between steps
- Responsive design for mobile devices
- Clear visual hierarchy with cards and shadows
- Emoji icons for engagement

### User Guidance
- Clear step headers with descriptions
- Success animations on completion
- Warning messages if betting profile not initialized
- Option to skip betting at any point
- Clear call-to-action buttons

### Error Handling
- Validates betting profile exists before allowing bets
- Shows initialization button if profile doesn't exist
- Displays error messages for failed operations
- Allows users to skip betting if issues arise

## Benefits

1. **Progressive Disclosure**: Users aren't overwhelmed with betting options upfront
2. **Flexibility**: Easy to skip betting if not interested
3. **Accountability**: Encourages users to bet on tasks for increased motivation
4. **Clear Flow**: Each step has a single focus
5. **Better UX**: Dedicated pages with clear context vs. cramped modal

## Usage

### Creating a Task with a Bet
1. Navigate to Dashboard
2. Click "+ Create New Task"
3. Fill out task details and submit
4. Click "Yes, Place a Bet" when prompted
5. Set wager and deadline
6. Submit bet

### Creating a Task without a Bet
1. Navigate to Dashboard
2. Click "+ Create New Task"
3. Fill out task details and submit
4. Click "Skip for Now"
5. View success message

## Future Enhancements

Potential improvements:
- Pre-fill bet deadline with task due date if provided
- Show suggested wager amounts based on task complexity
- Add task category/priority selection
- Allow editing task details before betting
- Show stats about past betting success rates
- Add social features (share bets with friends)

