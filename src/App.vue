<template>
  <div id="app">
    <TaskForm @submit-task="handleTaskSubmit" />
  </div>
</template>

<script setup lang="ts">
import TaskForm from './components/tasks/TaskForm.vue'

/**
 * Handle task submission event from TaskForm
 */
function handleTaskSubmit(taskId: string) {
  console.log('✅ Task submitted! Task ID:', taskId)
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}
</style>