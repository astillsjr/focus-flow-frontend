<template>
  <div class="login-form">
    <BaseCard padding="lg">
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
    router.push('/dashboard')
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
  margin: 2rem auto;
  padding: 0 1rem;
}

h2 {
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #4D4D4D;
  color: #B3B3B3;
  font-size: 0.9rem;
}

.register-link a {
  color: #BB86FC;
  font-weight: 500;
}
</style>