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
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import NudgeNotification from './components/nudges/NudgeNotification.vue'

const authStore = useAuthStore()

// Initialize auth store on app mount (restores session from localStorage)
// This will also start the unified SSE connection if user is authenticated
onMounted(() => {
  authStore.initialize()
})
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