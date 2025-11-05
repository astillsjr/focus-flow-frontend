<template>
  <div class="login-form" :style="cssVars">
    <BaseCard padding="lg">
      <div class="app-title">Focus Flow</div>
      <h2>Login</h2>
      
      <form @submit.prevent="handleLogin" class="form">
        <BaseInput
          v-model="username"
          label="Username"
          placeholder="Enter your username"
          required
          :disabled="isLoading"
          autocomplete="username"
        />

        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          :disabled="isLoading"
          :error="errorMessage"
          autocomplete="current-password"
        />

        <BaseButton 
          type="submit" 
          :loading="isLoading"
          full-width
        >
          Login
        </BaseButton>
      </form>

      <p class="register-link">
        Don't have an account? <router-link to="/register">Register here</router-link>
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
  'login-success': []
}>()


// Form state
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

/**
 * Handle login form submission
 */
async function handleLogin() {
  // Clear previous error
  errorMessage.value = ''
  
  // Set loading state
  isLoading.value = true

  try {
    // Call auth store login
    await authStore.login({
      username: username.value,
      password: password.value
    })

    // Login succeeded - emit success event
    emit('login-success')

    // Redirect to dashboard after successful login
    router.push('/tasks')
  } catch (error) {
    // Login failed - show error message
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
.login-form {
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

.register-link {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.register-link a {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}
</style>