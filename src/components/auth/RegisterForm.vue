<template>
  <div class="register-form" :style="cssVars">
    <BaseCard padding="lg">
      <div class="app-title">Focus Flow</div>
      <h2>Register</h2>
      
      <form @submit.prevent="handleRegister" class="form">
        <BaseInput
          v-model="username"
          label="Username"
          placeholder="Choose a username"
          required
          :disabled="isLoading"
          autocomplete="username"
        />

        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
          :disabled="isLoading"
          autocomplete="email"
        />

        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Choose a password"
          required
          :disabled="isLoading"
          :error="errorMessage"
          hint="Must be at least 8 characters"
          autocomplete="new-password"
        />

        <BaseButton 
          type="submit" 
          :loading="isLoading"
          full-width
        >
          Register
        </BaseButton>
      </form>

      <p class="login-link">
        Already have an account? <router-link to="/login">Login here</router-link>
      </p>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { BaseButton, BaseCard, BaseInput } from '../base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

// Get router and auth store
const router = useRouter()
const authStore = useAuthStore()

// Define emits
const emit = defineEmits<{
  'register-success': []
}>()


// Form state
const username = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

/**
 * Handle registration form submission
 */
async function handleRegister() {
  // Clear previous error
  errorMessage.value = ''
  
  // Set loading state
  isLoading.value = true

  try {
    // Call auth store register
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    })

    // Registration succeeded - emit success event
    emit('register-success')

    // Redirect to dashboard after successful registration
    router.push('/tasks')
  } catch (error) {
    // Registration failed - show error message
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
.register-form {
  max-width: 400px;
  margin: var(--spacing-xl) auto;
  padding: 0 var(--spacing-md);
}

.app-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
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

.login-link {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.login-link a {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}
</style>

