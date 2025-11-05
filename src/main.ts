import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import { useBetStore } from './stores/betStore'
import { useTaskStore } from './stores/taskStore'
import { useEmotionStore } from './stores/emotionStore'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

// Initialize auth state from localStorage FIRST (before router navigation)
// This ensures router guards have access to auth state
const authStore = useAuthStore()
authStore.initialize()

app.use(router)

// Initialize all stores that depend on authentication
// These will auto-check if user is authenticated and only load data if logged in
async function initializeStores() {
  const betStore = useBetStore()
  const taskStore = useTaskStore()
  const emotionStore = useEmotionStore()
  
  // Initialize stores in parallel since they're independent
  await Promise.all([
    betStore.initialize(),
    taskStore.initialize(),
    emotionStore.initialize()
  ])
}

// Initialize stores before mounting the app
await initializeStores()

app.mount('#app')