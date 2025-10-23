import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/authStore'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

// Initialize auth state from localStorage
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')