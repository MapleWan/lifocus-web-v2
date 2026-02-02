import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import LoginLayout from '@/views/auth/index.vue'

const defaultRoutes: Array<RouteRecordRaw> = [
  {
    path: '/auth',
    name: 'auth',
    meta: {
      title: '登录',
    },
    component: LoginLayout,
    children: [
      {
        path: '/auth/login',
        name: 'login',
        meta: {
          title: '登录',
        },
        component: () => import('@/views/auth/Login.vue'),
      },
      {
        path: '/auth/register',
        name: 'register',
        meta: {
          title: '注册',
        },
        component: () => import('@/views/auth/Register.vue'),
      },
    ],
  },
  {
    path: '/',
    name: 'dashboard',
    meta: {
      title: '首页',
    },
    component: () => import('@/views/dashboard/index.vue'),
  },
  {
    path: '/project',
    name: 'project',
    meta: {
      title: '项目',
    },
    component: () => import('@/layout/ProjectLayout/index.vue'),
    children: [
      {
        path: '/project/dashboard',
        name: 'projectDashboard',
        meta: {
          title: '项目工作台',
        },
        component: () => import('@/views/project/index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...defaultRoutes],
})

export default router
