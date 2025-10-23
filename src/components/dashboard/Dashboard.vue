<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <button @click="handleLogout" class="logout-button">Logout</button>
    </header>

    <section class="user-info">
      <h2>Welcome, {{ currentUser?.username }}!</h2>
      <div class="user-details">
        <p><strong>User ID:</strong> {{ currentUser?.id }}</p>
        <p><strong>Username:</strong> {{ currentUser?.username }}</p>
        <p><strong>Email:</strong> {{ currentUser?.email }}</p>
      </div>
    </section>

    <section class="tasks-section">
      <h2>Your Tasks</h2>
      <div class="tasks-placeholder">
        <p class="empty-state">No tasks yet. Start by creating your first task!</p>
        <!-- TaskManager components will be added here later -->
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

// Get auth store
const authStore = useAuthStore()

// Get current user from store
const currentUser = computed(() => authStore.currentUser)

/**
 * Handle logout button click
 */
async function handleLogout() {
  try {
    await authStore.logout()
    console.log('✅ User logged out successfully')
    
    // Optional: Redirect to login page (uncomment when router is set up)
    // router.push('/login')
  } catch (error) {
    console.error('❌ Logout error:', error)
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #d32f2f;
}

.user-info {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.user-info h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-details p {
  margin: 0;
  font-size: 1rem;
}

.user-details strong {
  color: #555;
}

.tasks-section {
  margin-top: 2rem;
}

.tasks-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.tasks-placeholder {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.empty-state {
  color: #888;
  font-size: 1rem;
  margin: 0;
}
</style>


