<script setup lang="ts">
import { ref } from 'vue'
import TaskItem from './components/tasks/TaskItem.vue'

const sampleTask = ref({
  _id: '1',
  user: 'demo-user',
  title: 'Write project documentation',
  description: 'Summarize key features and setup steps',
  createdAt: new Date().toISOString(),
  dueDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
  startedAt: null,
  completedAt: null
})

function handleToggleStart(taskId: string) {
  console.log('Task started:', taskId)
  sampleTask.value.startedAt = new Date().toISOString()
}

function handleToggleComplete(taskId: string) {
  console.log('Task completed:', taskId)
  sampleTask.value.completedAt = new Date().toISOString()
}

function handleDelete(taskId: string) {
  console.log('Task deleted:', taskId)
  alert('Task would be deleted in a real app!')
}
</script>

<template>
  <div style="max-width: 600px; margin: 2rem auto; padding: 1rem;">
    <h1 style="text-align: center; margin-bottom: 2rem;">TaskItem Test</h1>
    <TaskItem
      :task="sampleTask"
      @toggle-start="handleToggleStart"
      @toggle-complete="handleToggleComplete"
      @delete-task="handleDelete"
    />
  </div>
</template>