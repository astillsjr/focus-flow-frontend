import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import { useBetStore } from './stores/betStore'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Initialize auth state from localStorage
const authStore = useAuthStore()
authStore.initialize()

// Initialize bet store (will auto-check if user is authenticated)
const betStore = useBetStore()
betStore.initialize()

app.mount('#app')