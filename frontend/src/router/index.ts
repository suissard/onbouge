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
      path: '/event/edit/:id',
      name: 'event-edit',
      component: () => import('../views/EventEdit.vue'),
    },
    {
      path: '/event/view/:id',
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
      path: '/poi/edit/:id',
      name: 'poi-edit',
      component: () => import('../views/PoiEdit.vue'),
    },
    {
      path: '/poi/view/:id',
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
      path: '/user/edit/:id',
      name: 'user-edit',
      component: () => import('../views/UserEdit.vue'),
    },
    {
      path: '/user/view/:id',
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
      path: '/sport/view/:id',
      name: 'sport-view',
      component: () => import('../views/SportView.vue'),
    },
  ],
})

export default router
