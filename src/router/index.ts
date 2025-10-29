import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/auth/LoginForm.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/auth/RegisterForm.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/tasks/TasksDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/create',
    name: 'CreateTask',
    component: () => import('../components/tasks/TaskCreationFlow.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bets',
    name: 'Bets',
    component: () => import('../components/bets/BetsDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/emotions',
    name: 'Emotions',
    component: () => import('../components/emotions/EmotionsDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/demo',
    name: 'ComponentDemo',
    component: () => import('../components/base/BaseComponentsDemo.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router