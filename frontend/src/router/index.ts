import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/authStore'

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
      path: '/demonstration-vue',
      name: 'vue-demo',
      component: () => import('../views/VueDemo.vue'),
    },
    {
      path: '/events/:id/edit',
      name: 'event-edit',
      component: () => import('../views/EventEdit.vue'),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
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
      path: '/profiles/:id/edit',
      name: 'profile-edit',
      component: () => import('../views/UserEdit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profiles/:id',
      name: 'profile-view',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: () => import('../views/Profiles.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sports',
      name: 'sports',
      component: () => import('../views/Sports.vue'),
    },
    {
      path: '/sports/new',
      name: 'sport-create',
      component: () => import('../views/SportEdit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sports/:id/edit',
      name: 'sport-edit',
      component: () => import('../views/SportEdit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sports/:id',
      name: 'sport-view',
      component: () => import('../views/SportView.vue'),
    },
    {
      path: '/events/new',
      name: 'event-create',
      component: () => import('../views/EventEdit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pois/new',
      name: 'poi-create',
      component: () => import('../views/PoiEdit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/spatial-test',
      name: 'spatial-test',
      component: () => import('../views/SpatialTest.vue'),
    },
  ],
})

/**
 * A navigation guard that checks if a route requires authentication.
 * If the route requires authentication and the user is not logged in, they are redirected to the login page.
 * @param {import('vue-router').RouteLocationNormalized} to - The route being navigated to.
 * @param {import('vue-router').RouteLocationNormalized} from - The route being navigated from.
 * @param {import('vue-router').NavigationGuardNext} next - A function that resolves the navigation.
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
