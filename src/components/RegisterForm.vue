<template>
  <div class="register-form">
    <div class="card">
      <h2>Create Account</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="registerData.username"
            type="text"
            required
            :disabled="isLoading"
            placeholder="Choose a username"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="registerData.email"
            type="email"
            required
            :disabled="isLoading"
            placeholder="Enter your email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="registerData.password"
            type="password"
            required
            :disabled="isLoading"
            placeholder="Create a password"
            minlength="6"
          />
        </div>
        
        <button type="submit" class="btn" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="form-footer">
        <p>Already have an account? <a href="#" @click="$emit('switch-to-login')">Login here</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  'switch-to-login': []
}>()

const authStore = useAuthStore()

const registerData = ref({
  username: '',
  email: '',
  password: ''
})

const isLoading = computed(() => authStore.isLoading)
const error = computed(() => authStore.error)

const handleRegister = async () => {
  const success = await authStore.register(registerData.value)
  if (success) {
    // Registration successful, the auth store will handle the state
    console.log('Registration successful')
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 2rem auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer a {
  color: #007bff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>