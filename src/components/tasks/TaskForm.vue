<template>
  <div class="task-form">
    <h2 v-if="showTitle">Create New Task</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title <span class="required">*</span></label>
        <input
          id="title"
          v-model="title"
          type="text"
          placeholder="Enter task title"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="description"
          placeholder="Enter task description (optional)"
          rows="4"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="dueDate">Due Date</label>
        <input
          id="dueDate"
          v-model="dueDate"
          type="datetime-local"
          :disabled="isLoading"
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isLoading || !isFormValid" class="submit-button">
          {{ isLoading ? 'Creating...' : 'Create Task' }}
        </button>
        <button type="button" @click="clearForm" :disabled="isLoading" class="clear-button">
          Clear
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'

// Props
const props = withDefaults(defineProps<{
  showTitle?: boolean
}>(), {
  showTitle: true
})

// Define emits
const emit = defineEmits<{
  'submit-task': [taskId: string]
}>()

// Get task store
const taskStore = useTaskStore()

// Form state
const title = ref('')
const description = ref('')
const dueDate = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// Computed validation
const isFormValid = computed(() => {
  return title.value.trim().length > 0
})

/**
 * Clear the form fields
 */
function clearForm() {
  title.value = ''
  description.value = ''
  dueDate.value = ''
  errorMessage.value = ''
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  // Validate title is not empty or whitespace
  if (!title.value.trim()) {
    errorMessage.value = 'Title is required and cannot be empty'
    return
  }

  // Clear previous error
  errorMessage.value = ''
  
  // Set loading state
  isLoading.value = true

  try {
    // Create task payload
    const taskPayload = {
      title: title.value.trim(),
      description: description.value.trim(),
      dueDate: dueDate.value ? new Date(dueDate.value).toISOString() : undefined
    }

    // Call task store to create task
    const taskId = await taskStore.addTask(taskPayload)

    // Log success message
    console.log('✅ Task created successfully!', { taskId, title: taskPayload.title })

    // Emit success event with the new task ID
    emit('submit-task', taskId)

    // Clear form on success
    clearForm()

    // Optional: Redirect to dashboard (uncomment when router is set up)
    // router.push('/dashboard')
  } catch (error) {
    // Task creation failed - show error message
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }
    console.error('❌ Task creation error:', error)
  } finally {
    // Reset loading state
    isLoading.value = false
  }
}
</script>

<style scoped>
.task-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #f44336;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

textarea {
  resize: vertical;
}

input:disabled,
textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.submit-button,
.clear-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.clear-button {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ccc;
}

.clear-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

