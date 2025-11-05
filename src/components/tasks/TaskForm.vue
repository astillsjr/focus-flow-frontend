<template>
  <div class="task-form" :style="cssVars">
    <h2 v-if="showTitle">Create New Task</h2>
    
    <form @submit.prevent="handleSubmit" class="form">
      <BaseInput
        v-model="title"
        label="Title"
        placeholder="Enter task title"
        required
        :disabled="isLoading"
        :error="errorMessage"
      />

      <BaseInput
        v-model="description"
        label="Description"
        placeholder="Enter task description (optional)"
        multiline
        :rows="4"
        :disabled="isLoading"
      />

      <BaseInput
        v-model="dueDate"
        label="Due Date & Time"
        type="datetime-local"
        :disabled="isLoading"
      />

      <div class="form-actions">
        <BaseButton 
          type="submit" 
          :disabled="!isFormValid"
          :loading="isLoading"
        >
          Create Task
        </BaseButton>
        <BaseButton 
          type="button" 
          @click="clearForm" 
          :disabled="isLoading"
          variant="ghost"
        >
          Clear
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { BaseButton, BaseInput } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

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

    // Emit success event with the new task ID
    emit('submit-task', taskId)

    // Clear form on success
    clearForm()

    // Optional: Redirect to dashboard (uncomment when router is set up)
    // router.push('/tasks')
  } catch (error) {
    // Task creation failed - show error message
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }
    
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
  padding: var(--spacing-xl);
}

h2 {
  margin: 0 0 var(--spacing-lg) 0;
  text-align: center;
  color: var(--color-text);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

@media (max-width: 768px) {
  .task-form {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>

