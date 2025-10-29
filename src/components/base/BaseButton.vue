<template>
  <button 
    :type="type"
    :disabled="disabled || loading"
    :class="['base-button', `variant-${variant}`, `size-${size}`, { 'is-loading': loading, 'full-width': fullWidth }]"
  >
    <span v-if="loading" class="spinner"></span>
    <span :class="{ 'button-content': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.base-button:focus {
  outline: 2px solid #4CAF50;
  outline-offset: 2px;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sizes */
.size-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
}

.size-md {
  padding: 0.625rem 1.25rem;
  font-size: 1rem;
}

.size-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Variants */
.variant-primary {
  background-color: #4CAF50;
  color: white;
}

.variant-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.variant-secondary {
  background-color: #2196F3;
  color: white;
}

.variant-secondary:hover:not(:disabled) {
  background-color: #1976D2;
}

.variant-danger {
  background-color: #f44336;
  color: white;
}

.variant-danger:hover:not(:disabled) {
  background-color: #d32f2f;
}

.variant-ghost {
  background-color: transparent;
  color: #666666;
  border: 1px solid #e0e0e0;
}

.variant-ghost:hover:not(:disabled) {
  background-color: #f5f5f5;
  color: #333333;
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
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.variant-ghost .spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: #666666;
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

