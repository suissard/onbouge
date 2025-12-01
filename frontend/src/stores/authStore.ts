import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import strapi from '@/services/strapi';
import type { User } from '@/interfaces/user';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);
  if (token.value) strapi.setToken(token.value)

  /**
   * Fetches the current user's data from Strapi using the stored token.
   * If the token is invalid, it logs the user out.
   */
  async function fetchUser() {
    try {
      if (!token.value) return;
      const userData = await strapi.getMe();
      user.value = userData as User;
      return user.value;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout(); // Clear invalid token
    }
  }

  /**
   * Logs a user in with the provided credentials.
   * @param {string} identifier - The user's email or username.
   * @param {string} password - The user's password.
   * @returns {Promise<User>} A promise that resolves to the user object.
   */
  async function login(identifier: string, password: string): Promise<User> {
    const response = await strapi.login({identifier, password});
    const data = response as any;
    token.value = data.jwt;
    updateTokenlocalStorage(data.jwt);
    strapi.setToken(data.jwt);
    user.value = data.user;
    return user.value as User;
  }

  /**
   * Logs the current user out, clearing the user and token from the store and localStorage.
   */
  function logout() {
    user.value = null;
    token.value = null;
    strapi.signOut()
    updateTokenlocalStorage();
  }

  /**
   * Registers a new user with the provided information.
   * @param {Pick<User, 'username' | 'email'> & {password: string}} userInfo - An object containing the user's information (username, email, password).
   * @returns {Promise<User>} A promise that resolves to the new user object.
   */
  async function register(userInfo: Pick<User, 'username' | 'email'> & {password: string}): Promise<User> {
    const  { username, email, password} = userInfo
    const response = await strapi.register({username, email, password});
    token.value = response.jwt;
    updateTokenlocalStorage(response.jwt);
    user.value = response.user;
    strapi.setToken(response.jwt);
    return user.value as User;
  }

  /**
   * Updates the authentication token in localStorage.
   * @param {string | undefined} token - The new token to store. If undefined, the token is removed.
   */
  function updateTokenlocalStorage(token: string | undefined = undefined) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  fetchUser()

  /**
   * Checks if the current user can edit the given item.
   * @param {any} item - The item to check.
   * @returns {boolean} True if the user can edit, false otherwise.
   */
  function canEdit(item: any): boolean {
    if (!isAuthenticated.value || !user.value) return false;
    if (['Ambassador', "Administrateur"].includes(user.value.role?.name)) return true;
    if (item?.author?.documentId === user.value.documentId) return true;
    if (item?.author?.id === user.value.id) return true;
    return false;
  }

  /**
   * Checks if the current user can delete the given item.
   * @param {any} item - The item to check.
   * @returns {boolean} True if the user can delete, false otherwise.
   */
  function canDelete(item: any): boolean {
    return canEdit(item); // Same logic for now
  }

  return { user, token, login, logout, register, fetchUser, isAuthenticated, canEdit, canDelete };
});