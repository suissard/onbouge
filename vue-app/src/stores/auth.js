import { defineStore } from 'pinia';
import strapi from '@/strapi';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const jwt = ref(localStorage.getItem('jwt'));

  // If a JWT is found in local storage, set the authorization header
  if (jwt.value) {
    strapi.setAuth(jwt.value);
  }

  async function login(identifier, password) {
    try {
      const response = await strapi.login(identifier, password);
      jwt.value = response.jwt;
      user.value = response.user;
      strapi.setAuth(response.jwt);
      localStorage.setItem('jwt', response.jwt);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error };
    }
  }

  function logout() {
    user.value = null;
    jwt.value = null;
    strapi.removeAuth();
    localStorage.removeItem('jwt');
  }

  async function fetchUser() {
    if (!jwt.value) return;
    try {
      user.value = await strapi.get('users/me');
    } catch(error) {
      console.error("Failed to fetch user", error);
      logout(); // If token is invalid, log out
    }
  }

  async function register(username, email, password) {
    try {
      // Assuming the client has a 'register' method
      const response = await strapi.register({ username, email, password });
      jwt.value = response.jwt;
      user.value = response.user;
      strapi.setAuth(response.jwt);
      localStorage.setItem('jwt', response.jwt);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error };
    }
  }

  return { user, jwt, login, logout, fetchUser, register };
});
