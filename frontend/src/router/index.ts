import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/events/:id/edit',
      name: 'event-edit',
      component: () => import('../views/EventEdit.vue'),
    },
    {
      path: '/events/:id',
      name: 'event-view',
      component: () => import('../views/EventView.vue'),
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/Events.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/pois/:id/edit',
      name: 'poi-edit',
      component: () => import('../views/PoiEdit.vue'),
    },
    {
      path: '/pois/:id',
      name: 'poi-view',
      component: () => import('../views/PoiView.vue'),
    },
    {
      path: '/pois',
      name: 'pois',
      component: () => import('../views/Pois.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
    },
    {
      path: '/users/:id/edit',
      name: 'user-edit',
      component: () => import('../views/UserEdit.vue'),
    },
    {
      path: '/users/:id',
      name: 'user-view',
      component: () => import('../views/UserView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/Users.vue'),
    },
    {
      path: '/sports',
      name: 'sports',
      component: () => import('../views/Sports.vue'),
    },
    {
      path: '/sports/:id',
      name: 'sport-view',
      component: () => import('../views/SportView.vue'),
    },
  ],
})

export default router
