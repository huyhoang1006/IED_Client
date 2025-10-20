import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '@/views/LoginView/index.vue'
import TreeNavigation from '@/views/TreeNode/treeNavigation.vue'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/login',
    redirect: '/'
  },
  {
    path: '/dashboard',
    component: Layout,
    children: [
      {
        path: '',
        name: 'TreeNavigation',
        component: TreeNavigation
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Route guard để kiểm tra authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user') || sessionStorage.getItem('user')
  
  if (to.path === '/' || to.path === '/login') {
    // Nếu đã đăng nhập và đang cố truy cập login page, redirect về dashboard
    if (isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    // Nếu chưa đăng nhập và cố truy cập protected route, redirect về login
    if (!isAuthenticated) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
