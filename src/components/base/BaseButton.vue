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
  outline: 2px solid #BB86FC;
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
  background-color: #BB86FC;
  color: #000000;
}

.variant-primary:hover:not(:disabled) {
  background-color: #C693FC;
}

.variant-secondary {
  background-color: #03DAC6;
  color: #000000;
}

.variant-secondary:hover:not(:disabled) {
  background-color: #26E0D1;
}

.variant-danger {
  background-color: #dc3545;
  color: #ffffff;
}

.variant-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.variant-ghost {
  background-color: transparent;
  color: #B3B3B3;
  border: 1px solid #4D4D4D;
}

.variant-ghost:hover:not(:disabled) {
  background-color: #1E1E1E;
  color: #FFFFFF;
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
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: #B3B3B3;
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

