<template>
  <div class="register-form">
    <BaseCard padding="lg">
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
    router.push('/dashboard')
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
  color: #666666;
  font-size: 0.9rem;
}

.login-link a {
  color: #4CAF50;
  font-weight: 500;
}
</style>

