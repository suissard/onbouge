import { defineStore } from 'pinia';
import { ref } from 'vue';
import strapi from '@/services/strapi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  if (token.value) strapi.setToken(token.value)

  /**
   * Fetches the current user's data from Strapi using the stored token.
   * If the token is invalid, it logs the user out.
   */
  async function fetchUser() {
    try {
      if (!token.value) return
      const response = await strapi.get('users/me');
      user.value = response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout(); // Clear invalid token
    }
  }

  /**
   * Logs a user in with the provided credentials.
   * @param {string} identifier - The user's email or username.
   * @param {string} password - The user's password.
   * @returns {Promise<any>} A promise that resolves to the user object.
   */
  async function login(identifier: string, password: string) {
    const response = await strapi.login(identifier, password);
    // ========================== TODO debug la librairi, elle envoie une token undefined
    // const response = await strapi.axios({
    //   url: strapi.prefix + "auth/local",
    //   method: "post",
    //   data: {
    //     identifier,
    //     password,
    //   },
    //   baseURL: strapi.baseURL + "/",
    // })
    //  =================
    console.log("login",response)
    updateTokenlocalStorage(response.jwt);
    return user.value = response?.user;
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
   * @param {any} userInfo - An object containing the user's information (username, email, password).
   * @returns {Promise<any>} A promise that resolves to the new user object.
   */
  async function register(userInfo: any) {
    const  { username, email, password} = userInfo
    const response = await strapi.register(username, email, password);
    // const response = await strapi.request(strapi.prefix + "auth/local/register", "post", { username, email, password} );

    updateTokenlocalStorage(response.data?.jwt);
    return user.value = response.data?.user;
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

  return { user, token, login, logout, register, fetchUser };
});