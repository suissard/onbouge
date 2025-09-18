import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/index', // a redirect for old /index.html links
    redirect: '/'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue')
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventsView.vue')
  },
  {
    path: '/pois',
    name: 'pois',
    component: () => import('@/views/PoisView.vue')
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forum',
    name: 'forum',
    component: () => import('@/views/ForumView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/data',
    name: 'data',
    component: () => import('@/views/DataView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // We need to make sure the store is initialized before we can use it.
  // However, since we are using it outside a component, we can just import it.
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.jwt) {
    // Redirect to login page if not authenticated
    next({ name: 'login' });
  } else {
    next(); // Proceed to route
  }
});

export default router;
