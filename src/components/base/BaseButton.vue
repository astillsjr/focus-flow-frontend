<template>
  <button 
    :type="type"
    :disabled="disabled || loading"
    :class="['base-button', `variant-${variant}`, `size-${size}`, { 'is-loading': loading, 'full-width': fullWidth }]"
    :style="cssVars"
  >
    <span v-if="loading" class="spinner"></span>
    <span :class="{ 'button-content': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { useDesignTokens } from '@/composables/useDesignTokens'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false
})

const { cssVars } = useDesignTokens()
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.base-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sizes */
.size-sm {
  padding: var(--spacing-sm) 0.875rem;
  font-size: var(--font-size-sm);
}

.size-md {
  padding: 0.625rem 1.25rem;
  font-size: var(--font-size-base);
}

.size-lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

/* Variants */
.variant-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.variant-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.variant-secondary {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.variant-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
}

.variant-danger {
  background-color: var(--color-error);
  color: var(--color-text);
}

.variant-danger:hover:not(:disabled) {
  background-color: var(--color-error-hover);
}

.variant-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.variant-ghost:hover:not(:disabled) {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

/* Loading state */
.is-loading {
  position: relative;
  cursor: wait;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

.variant-ghost .spinner {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-text-secondary);
}

.button-content {
  opacity: 0.7;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Full width */
.full-width {
  width: 100%;
}
</style>

