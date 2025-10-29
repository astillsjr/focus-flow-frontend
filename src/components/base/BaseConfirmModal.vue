<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
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
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1E1E1E;
  border: 1px solid #4D4D4D;
  border-radius: 12px;
  padding: 0;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #4D4D4D;
  background-color: #1E1E1E;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #FFFFFF;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header h3::before {
  content: '⚠️';
  font-size: 1.1rem;
}

.modal-body {
  padding: 1.5rem;
  background-color: #1E1E1E;
}

.modal-body p {
  margin: 0;
  color: #E5E5E5;
  line-height: 1.6;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  background-color: #2A2A2A;
  border-top: 1px solid #4D4D4D;
}

.cancel-button {
  transition: all 0.2s ease;
  position: relative;
  background-color: #404040;
  border-color: #6B7280;
  color: #FFFFFF;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
}

.cancel-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  background-color: #4A4A4A;
  border-color: #9CA3AF;
  color: #FFFFFF;
}

.cancel-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  background-color: #525252;
}

.confirm-button {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  background-color: #DC2626;
  border-color: #DC2626;
  color: #FFFFFF;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5);
  background-color: #B91C1C;
  border-color: #B91C1C;
}

.confirm-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 3px 8px rgba(220, 38, 38, 0.4);
  background-color: #991B1B;
  border-color: #991B1B;
}

.confirm-button:focus:not(:disabled) {
  outline: 2px solid #DC2626;
  outline-offset: 2px;
}

.cancel-button:focus:not(:disabled) {
  outline: 2px solid #6B7280;
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
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
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
    margin: 1rem;
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
  
  .cancel-button:hover:not(:disabled),
  .confirm-button:hover:not(:disabled) {
    transform: none;
  }
}
</style>
