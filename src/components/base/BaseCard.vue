<template>
  <div 
    :class="['base-card', `padding-${padding}`, { hoverable, clickable }]" 
    :style="cssVars"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useDesignTokens } from '@/composables/useDesignTokens'

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false,
  clickable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}

const { cssVars } = useDesignTokens()
</script>

<style scoped>
.base-card {
  background-color: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

/* Padding variants */
.padding-none {
  padding: 0;
}

.padding-sm {
  padding: 0.75rem;
}

.padding-md {
  padding: var(--spacing-md);
}

.padding-lg {
  padding: var(--spacing-lg);
}

/* Hoverable */
.hoverable:hover {
  box-shadow: var(--shadow-md);
  background-color: var(--color-surface-container-high);
}

/* Clickable */
.clickable {
  cursor: pointer;
}

.clickable:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-dark);
  background-color: var(--color-surface-container-high);
}

.clickable:active {
  transform: translateY(1px);
}
</style>

