import { defineStore } from 'pinia';
import { ref } from 'vue';
import strapi from '@/services/strapi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  if (token.value) strapi.setToken(token.value)

  async function fetchUser() {
    try {
      if (!token.value) return
      const response = await strapi.get('users/me', true);
      user.value = response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout(); // Clear invalid token
    }
  }

  async function login(identifier: string, password: string) {
    // const response = await strapi.login(identifier, password);
    // ========================== TODO debug la librairi, elle envoie une token undefined
    const response = await strapi.axios({
      url: strapi.prefix + "auth/local",
      method: "post",
      data: {
        identifier,
        password,
      },
      baseURL: strapi.baseURL + "/",
    })
    //  =================
    updateTokenlocalStorage(response.data.jwt);
    return user.value = response?.data?.user;
  }

  function logout() {
    user.value = null;
    token.value = null;
    strapi.signOut()
    updateTokenlocalStorage();
  }

  async function register(userInfo: any) {
    // const response = await strapi.register(userInfo);
    // ========================== TODO debug la librairi, elle envoie une token undefined
    const response = await strapi.axios({
      url: strapi.prefix + "auth/local/register",
      method: "post",
      data: userInfo,
      baseURL: strapi.baseURL + "/",
    })
    // ======================================
    updateTokenlocalStorage(response.data?.jwt);
    return user.value = response.data?.user;
  }

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