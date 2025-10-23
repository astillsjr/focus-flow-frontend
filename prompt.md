You are assisting me in implementing a Vue.js frontend for my app. 
The frontend uses:
- Vue 3 with <script setup>
- Pinia for state management
- Fetch API for backend requests
- useAuthStore for access tokens and current user info

The backend provides authentication endpoints:
- POST /api/TaskManger/createTask →  creates a new task
- POST /api/TaskManger/updateTask → updates a task
- POST /api/TaskManager/deleteTask → deletes a task
- POST /api/TaskManager/getTasks → retireves users tasks

Each Task has the following structure:
{
    _id: string,
    user: string,
    title: string,
    description: string,
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    dueDate?: Date;
}

The app requirements:
1. Load all pending tasks for the current user from the API.
2. The store should hold a reactive array tasks containing the user’s pending tasks.
3. All requests should include the userId from authStore.
4. When logging out, clear Pinia store and localStorage.
5. Components should be reactive and respond to auth changes.

Step 1: Implement Pinia taskStore with state, getters, and actions for addTask, updateTask, deleteTask, markStarted and markCompleted
Step 2: Implement TaskItem.vue that binds a single task, emits events (delete, start, complete)
Step 3: Implement TaskList.vue that binds all tasks for a user
Step 4: Implement TaskForm.vue for creating and updating tasks

Please generate the Pinia store first, fully typed, with all actions and persistence, in a format I can copy into `taskStore.ts`.
