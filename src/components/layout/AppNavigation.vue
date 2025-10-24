<template>
  <nav class="app-navigation">
    <router-link to="/dashboard" class="nav-link">Tasks</router-link>
    <router-link to="/emotions" class="nav-link">Emotions</router-link>
    <router-link to="/bets" class="nav-link">Bets</router-link>
    <button @click="handleLogout" class="logout-button">Logout</button>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>

<style scoped>
.app-navigation {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.nav-link:hover {
  background-color: #f5f5f5;
}

.nav-link.router-link-active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.logout-button {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #555;
}

@media (max-width: 768px) {
  .app-navigation {
    flex-wrap: wrap;
  }
  
  .logout-button {
    margin-left: 0;
    width: 100%;
  }
}
</style>

