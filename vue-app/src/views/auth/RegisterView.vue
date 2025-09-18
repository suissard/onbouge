<template>
  <div class="auth-page">
    <h1>S'inscrire</h1>
    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit" class="btn-primary">S'inscrire</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref(null);

const handleRegister = async () => {
  error.value = null;
  // I need to add the register function to the store first.
  if (authStore.register) {
    const result = await authStore.register(username.value, email.value, password.value);
    if (result.success) {
      router.push('/'); // Redirect to home on successful registration
    } else {
      error.value = 'L\'inscription a échoué. Veuillez réessayer.';
    }
  } else {
      error.value = 'La fonction d\'inscription n\'est pas encore implémentée.';
  }
};
</script>

<style scoped>
.auth-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.auth-form .form-group {
  margin-bottom: 1rem;
}
.auth-form label {
  display: block;
  margin-bottom: 0.5rem;
}
.auth-form input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
