<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Focus Flow</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <div v-if="!isAuthenticated" class="auth-links">
          <button @click="showLogin = true" class="btn btn-sm">Login</button>
          <button @click="showRegister = true" class="btn btn-sm">Register</button>
        </div>
        <div v-else class="user-menu">
          <span class="user-name">Welcome, User!</span>
          <button @click="handleLogout" class="btn btn-sm btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>

    <!-- Auth Modals -->
    <div v-if="showLogin" class="modal-overlay" @click="showLogin = false">
      <div class="modal" @click.stop>
        <LoginForm @switch-to-register="switchToRegister" />
      </div>
    </div>

    <div v-if="showRegister" class="modal-overlay" @click="showRegister = false">
      <div class="modal" @click.stop>
        <RegisterForm @switch-to-login="switchToLogin" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/LoginForm.vue'
import RegisterForm from '@/components/RegisterForm.vue'

const authStore = useAuthStore()

const showLogin = ref(false)
const showRegister = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const switchToRegister = () => {
  showLogin.value = false
  showRegister.value = true
}

const switchToLogin = () => {
  showRegister.value = false
  showLogin.value = true
}

const handleLogout = async () => {
  await authStore.logout()
}

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.auth-links {
  display: flex;
  gap: 0.5rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: white;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.modal-overlay {
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
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 2rem;
}
</style>