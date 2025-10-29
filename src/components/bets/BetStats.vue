<template>
  <div v-if="stats" class="bet-stats">
    <BaseCard padding="md" class="stat-card">
      <span class="stat-label">Points</span>
      <span class="stat-value">{{ stats.points }}</span>
    </BaseCard>
    <BaseCard padding="md" class="stat-card">
      <span class="stat-label">Streak</span>
      <span class="stat-value">{{ stats.streak }}</span>
    </BaseCard>
    <BaseCard padding="md" class="stat-card">
      <span class="stat-label">Active Wagers</span>
      <span class="stat-value">{{ totalWagered }} pts</span>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBetStore } from '../../stores/betStore'
import { BaseCard } from '../base'

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
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #B3B3B3;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
