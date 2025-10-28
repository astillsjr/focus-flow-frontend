<template>
  <div id="app">
    <!-- Nudge notification system -->
    <NudgeNotification />
    
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useNudgeStore } from './stores/nudgeStore'
import NudgeNotification from './components/nudges/NudgeNotification.vue'

const authStore = useAuthStore()
const nudgeStore = useNudgeStore()

// Start nudge polling when app mounts and user is authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    nudgeStore.startPolling(60000) // Poll every 60 seconds (1 minute)
  }
})

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Start polling when user logs in
      nudgeStore.startPolling(60000)
    }
  }
)
</script>