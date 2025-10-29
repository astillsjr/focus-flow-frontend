<template>
  <nav class="app-navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <span class="brand-text">Focus Flow</span>
      </div>
      
      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">
          Tasks
        </router-link>
        <router-link to="/emotions" class="nav-link">
          Emotions
        </router-link>
        <router-link to="/bets" class="nav-link">
          Bets
        </router-link>
      </div>
      
      <button @click="handleLogout" class="logout-button">
        Logout
      </button>
    </div>
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
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Brand */
.nav-brand {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.25rem;
  color: #333333;
}

.brand-text {
  display: inline;
}

/* Navigation Links */
.nav-links {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  display: inline-block;
  padding: 0.625rem 1rem;
  text-decoration: none;
  color: #666666;
  border-radius: 8px;
  background: transparent;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f5f5f5;
  color: #333333;
  text-decoration: none;
}

.nav-link.router-link-active {
  background-color: #4CAF50;
  color: white;
}

.nav-link.router-link-active:hover {
  background-color: #45a049;
}

/* Logout Button */
.logout-button {
  margin-left: auto;
  padding: 0.625rem 1.25rem;
  background-color: #757575;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #616161;
}

.logout-button:focus {
  outline: 2px solid #757575;
  outline-offset: 2px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .nav-brand {
    flex-basis: 100%;
  }
  
  .nav-links {
    flex-basis: 100%;
    order: 3;
  }
  
  .nav-link {
    flex: 1;
    text-align: center;
  }
  
  .logout-button {
    margin-left: 0;
    flex: 1;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0.75rem;
  }
  
  .nav-link,
  .logout-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>

