import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import Dashboard from '../views/Dashboard.vue'
import Chat from '../views/Chat.vue'
import Commands from '../views/Commands.vue'
import Config from '../views/Config.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/commands',
    name: 'Commands',
    component: Commands
  },
  {
    path: '/config',
    name: 'Config',
    component: Config
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Guarda de navegação
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = !!localStorage.getItem('token')

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
