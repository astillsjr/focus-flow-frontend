<template>
  <div id="app">
    <!-- Nudge notification system -->
    <NudgeNotification />
    
    <router-view v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>
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

<style>
/* Page Route Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>