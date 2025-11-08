<template>
  <v-container>
    <h1>Register</h1>
    <v-form @submit.prevent="handleSubmit">
      <v-alert v-if="error" type="error" dense>
        {{ error }}
      </v-alert>
      <v-text-field
        v-model="username"
        label="Username"
        required
      ></v-text-field>
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        required
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        required
      ></v-text-field>
      <v-btn type="submit" color="primary">Register</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const router = useRouter();
const authStore = useAuthStore();

const handleSubmit = async () => {
  try {
    error.value = null;
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });
    router.push('/');
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.';
    console.error('Registration failed:', err);
  }
};
</script>
