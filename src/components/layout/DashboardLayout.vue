<template>
  <div class="dashboard-layout" :style="cssVars">
    <AppNavigation />
    <main class="dashboard-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavigation from './AppNavigation.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background-color: var(--color-background);
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: var(--spacing-md) var(--spacing-sm);
  }
}
</style>

