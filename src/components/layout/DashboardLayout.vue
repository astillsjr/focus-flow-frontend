<template>
  <div class="dashboard-layout">
    <AppNavigation />
    <main class="dashboard-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavigation from './AppNavigation.vue'
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background-color: #121212;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem 0.5rem;
  }
}
</style>

