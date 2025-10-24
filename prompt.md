

You are assisting me in implementing the frontend for my FocusFlow app using Vue 3 and Pinia.

**Context:**

* The task store (`useTaskStore`) is already implemented with `markStarted()`, `markCompleted()`, `deleteTask()`, and `getTaskStatus()`.
* Each task has the following structure:
{
  _id: string
  user: string
  title: string
  description?: string
  createdAt: Date | string
  startedAt?: Date | string
  completedAt?: Date | string
  dueDate?: Date | string
}


**Task:**
Create a Vue 3 component named `TaskItem.vue` using `<script setup>` syntax.

**Requirements:**
1. Accept a single `task` prop with the structure above.
2. Display the task’s title, description (if any), due date (if any, formatted nicely), and status (pending, in-progress, complete).
3. Include two buttons:
   - "Start" (or "Complete" if already started)
   - "Delete"
4. When the user clicks these buttons, emit `toggle-start`, `toggle-complete` and `delete-task` events with the task’s `id` and updated status.
5. Add minimal styling to differentiate completed tasks (e.g., faded text or background color).
6. Keep the design minimal — focus on functionality, not appearance.


Use best practices with `ref()`, `v-model`, and reactive data (if applicable).
Return only the complete `TaskItem.vue` file.
