<template>
  <div class="task-form-overlay" @click="handleOverlayClick">
    <div class="task-form-modal" @click.stop>
      <div class="task-form-header">
        <h3>Create New Task</h3>
        <button @click="closeForm" class="close-btn" aria-label="Close">
          <span class="close-icon">×</span>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="task-form">
        <div class="form-group">
          <label for="title" class="form-label">
            Task Title <span class="required">*</span>
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            :disabled="isLoading"
            placeholder="Enter a descriptive title for your task"
            class="form-input"
            maxlength="100"
          />
          <div class="input-help">Be specific and clear about what needs to be done</div>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            :disabled="isLoading"
            placeholder="Add any additional details, context, or requirements"
            class="form-textarea"
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="input-help">Optional: Provide more context or requirements</div>
        </div>

        <div class="form-group">
          <label for="dueDate" class="form-label">Due Date & Time</label>
          <input
            id="dueDate"
            v-model="formData.dueDate"
            type="datetime-local"
            :disabled="isLoading"
            :min="minDateTime"
            class="form-input"
          />
          <div class="input-help">Optional: Set a deadline for this task</div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="closeForm"
            class="btn btn-secondary"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="spinner-small"></span>
            {{ isLoading ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'

const emit = defineEmits<{
  'task-created': []
  'form-closed': []
}>()

const tasksStore = useTasksStore()

// Form data
const formData = ref({
  title: '',
  description: '',
  dueDate: ''
})

// Computed properties
const isLoading = computed(() => tasksStore.isLoading)
const error = computed(() => tasksStore.error)

const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0
})

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

// Methods
const closeForm = () => {
  emit('form-closed')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeForm()
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  const taskData = {
    title: formData.value.title.trim(),
    description: formData.value.description.trim(),
    dueDate: formData.value.dueDate ? new Date(formData.value.dueDate) : undefined
  }

  const success = await tasksStore.createTask(taskData)

  if (success) {
    // Reset form
    formData.value = {
      title: '',
      description: '',
      dueDate: ''
    }
    emit('task-created')
  }
}

// Lifecycle
onMounted(() => {
  // Focus the title input when the form opens
  const titleInput = document.getElementById('title') as HTMLInputElement
  if (titleInput) {
    titleInput.focus()
  }
})
</script>

<style scoped>
.task-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.task-form-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.task-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.task-form-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f8f9fa;
}

.task-form {
  padding: 0 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:disabled, .form-textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.input-help {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .task-form-modal {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
