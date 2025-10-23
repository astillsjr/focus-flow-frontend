

You are assisting me in implementing the frontend for my FocusFlow app using Vue 3 and Pinia.

**Context:**

* The app already has `authStore` and `taskStore` implemented.
* `taskStore` exposes an action `createTask()` that adds a new task to the user’s task list.
* The parent component listens for the submit-task event, which provides the new task’s details.
* The user is already authenticated and `authStore.currentUser` is available.


**Task:**
Create a Vue 3 component named `TaskForm.vue` using `<script setup>` syntax.

**Requirements:**
1. Reactive form fields for title, description (optional), and dueDate (optional).
2. When the user submits the form, call `taskStore.createTask(user, title, description?, dueDate?)` and clear the input field.
3. Prevent submission if the title input is empty or whitespace.
4. If creation succeeds, emit a `submit-task` event or redirect to the dashboard (you can stub navigation logic for now).
5. Log a message to the console on successful task creation.
6. Keep the design minimal — focus on functionality, not appearance.


Use best practices with `ref()`, `v-model`, and `@submit.prevent`.
Return only the complete `TaskForm.vue` file.
