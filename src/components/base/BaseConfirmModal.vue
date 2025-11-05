<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" :style="cssVars" @click.self="handleCancel">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ title }}</h3>
        </div>
        
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>

        <div class="modal-actions">
          <BaseButton 
            @click="handleCancel" 
            variant="ghost"
            :disabled="loading"
            class="cancel-button"
          >
            Cancel
          </BaseButton>
          <BaseButton 
            @click="handleConfirm" 
            variant="danger"
            :loading="loading"
            class="confirm-button"
          >
            {{ confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'

const props = withDefaults(defineProps<{
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  loading?: boolean
}>(), {
  title: 'Confirm Action',
  confirmText: 'Confirm',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  if (!props.loading) {
    emit('confirm')
  }
}

function handleCancel() {
  if (!props.loading) {
    emit('cancel')
  }
}

const { cssVars } = useDesignTokens()
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-slow);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform var(--transition-slow);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  background-color: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0;
  max-width: 420px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface-variant);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.modal-header h3::before {
  content: '⚠️';
  font-size: 1.1rem;
}

.modal-body {
  padding: var(--spacing-lg);
  background-color: var(--color-surface-variant);
}

.modal-body p {
  margin: 0;
  color: var(--color-on-surface);
  line-height: var(--line-height-relaxed);
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding: var(--spacing-lg);
  background-color: var(--color-surface-container-high);
  border-top: 1px solid var(--color-border);
}

.cancel-button {
  transition: all var(--transition-normal);
  position: relative;
}

.confirm-button {
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.confirm-button:focus:not(:disabled) {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.cancel-button:focus:not(:disabled) {
  outline: 2px solid var(--color-outline);
  outline-offset: 2px;
}

/* Ripple effect for better feedback */
.cancel-button::before,
.confirm-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: var(--radius-full);
  background-color: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width var(--transition-slow), height var(--transition-slow);
  pointer-events: none;
}

.cancel-button:active::before,
.confirm-button:active::before {
  width: 200px;
  height: 200px;
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .modal-header {
    padding: 1.25rem 1.25rem 0.75rem 1.25rem;
  }
  
  .modal-body {
    padding: 1.25rem;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
  }
}
</style>
