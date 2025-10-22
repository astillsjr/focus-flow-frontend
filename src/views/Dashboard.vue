<template>
  <div class="dashboard-view">
    <FocusFlowDashboard />
  </div>
</template>

<script setup lang="ts">
import FocusFlowDashboard from '@/components/FocusFlowDashboard.vue'
</script>

<style scoped>
.dashboard-view {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}
</style>