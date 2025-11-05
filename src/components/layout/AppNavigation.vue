<template>
  <nav class="app-navigation" :style="cssVars">
    <div class="nav-container">
      <div class="nav-brand">
        <span class="brand-text">Focus Flow</span>
      </div>
      
      <div class="nav-links">
        <router-link to="/tasks" class="nav-link">
          Tasks
        </router-link>
        <router-link to="/emotions" class="nav-link">
          Emotions
        </router-link>
        <router-link to="/bets" class="nav-link">
          Bets
        </router-link>
      </div>
      
      <div class="user-actions">
        <span
          class="user-name"
          v-if="authStore.username"
          @click="goToAccount"
          role="button"
          tabindex="0"
          title="Open account settings"
          @keypress.enter="goToAccount"
        >
          {{ authStore.username }}
          <span class="user-caret" aria-hidden="true">›</span>
        </span>
        <button @click="handleLogout" class="logout-button">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDesignTokens } from '@/composables/useDesignTokens'

const router = useRouter()
const authStore = useAuthStore()
const { cssVars } = useDesignTokens()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const goToAccount = () => {
  router.push('/account')
}
</script>

<style scoped>
.app-navigation {
  background: var(--color-surface-variant);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

/* Brand */
.nav-brand {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xl);
  color: var(--color-text);
}

.brand-text {
  display: inline;
}

/* Navigation Links */
.nav-links {
  display: flex;
  gap: var(--spacing-sm);
  flex: 1;
}

.nav-link {
  display: inline-block;
  padding: 0.625rem var(--spacing-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  background: transparent;
  font-weight: var(--font-weight-medium);
  font-size: 0.9375rem;
  transition: all var(--transition-normal);
}

.nav-link:hover {
  background-color: var(--color-surface-container-high);
  color: var(--color-text);
  text-decoration: none;
}

.nav-link.router-link-active {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.nav-link.router-link-active:hover {
  background-color: var(--color-primary-hover);
}

/* Logout Button */
.logout-button {
  margin-left: 0;
  padding: 0.625rem 1.25rem;
  background-color: var(--color-border);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.logout-button:hover {
  background-color: var(--color-border-dark);
}

.logout-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.user-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  font-size: 0.9375rem;
  opacity: 0.9;
  cursor: pointer;
}

.user-name:hover,
.user-name:focus {
  text-decoration: underline;
}

.user-caret {
  margin-left: 4px;
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    gap: var(--spacing-md);
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
    padding: var(--spacing-sm) 0.75rem;
    font-size: var(--font-size-sm);
  }
}
</style>

