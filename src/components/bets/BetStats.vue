<template>
  <div v-if="stats" class="bet-stats" :style="cssVars">
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
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

const betStore = useBetStore()

const stats = computed(() => betStore.stats)
const totalWagered = computed(() => betStore.totalWagered)
</script>

<style scoped>
.bet-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}
</style>
