<template>
  <v-container>
    <h1>Login</h1>
    <v-form @submit.prevent="handleSubmit">
      <v-alert v-if="error" type="error" dense>
        {{ error }}
      </v-alert>
      <v-text-field v-model="email" label="Email" type="email" required></v-text-field>
      <v-text-field v-model="password" label="Password" type="password" required></v-text-field>
      <v-btn type="submit" color="primary">Login</v-btn>
    </v-form>

    <v-divider class="my-4"></v-divider>

    <div class="d-flex flex-column align-center">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <div v-bind="props">
            <v-btn disabled class="mb-2" color="primary" width="300px">Se connecter avec Google</v-btn>
          </div>
        </template>
        <span>Bientôt disponible</span>
      </v-tooltip>
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <div v-bind="props">
            <v-btn disabled color="primary" width="300px">Se connecter avec Facebook</v-btn>
          </div>
        </template>
        <span>Bientôt disponible</span>
      </v-tooltip>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const router = useRouter();
const authStore = useAuthStore();

/**
 * Handles the login form submission.
 * It calls the auth store's login action and redirects to the homepage on success.
 * If the login fails, it displays an error message.
 */
const handleSubmit = async () => {
  try {
    error.value = null;
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.';
    console.error('Login failed:', err);
  }
};
</script>
