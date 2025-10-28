<template>
  <div v-if="stats" class="bet-stats">
    <div class="stat-card">
      <span class="stat-label">Points</span>
      <span class="stat-value">{{ stats.points }}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Streak</span>
      <span class="stat-value">{{ stats.streak }}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Active Wagers</span>
      <span class="stat-value">{{ totalWagered }} pts</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBetStore } from '../../stores/betStore'

const betStore = useBetStore()

const stats = computed(() => betStore.stats)
const totalWagered = computed(() => betStore.totalWagered)
</script>

<style scoped>
.bet-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}
</style>
