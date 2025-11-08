import { defineStore } from 'pinia';
import { ref } from 'vue';
import strapi from '@/services/strapi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  async function fetchUser() {
    if (token.value) {
      try {
        const response = await strapi.get('users/me');
        user.value = response.data;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout(); // Clear invalid token
      }
    }
  }

  if (token.value) {
    fetchUser();
  }

  async function login(credentials: any) {
    const response = await strapi.login(credentials);
    token.value = response.jwt;
    user.value = response.user;
    localStorage.setItem('token', response.jwt);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  async function register(userInfo: any) {
    const response = await strapi.register(userInfo);
    token.value = response.jwt;
    user.value = response.user;
    localStorage.setItem('token', response.jwt);
  }

  return { user, token, login, logout, register, fetchUser };
});
