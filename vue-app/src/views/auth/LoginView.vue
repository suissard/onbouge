<template>
  <div class="auth-page">
    <h1>Se connecter</h1>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <label for="identifier">Email ou Nom d'utilisateur</label>
        <input type="text" id="identifier" v-model="identifier" required>
      </div>
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit" class="btn-primary">Se connecter</button>
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

const identifier = ref('');
const password = ref('');
const error = ref(null);

const handleLogin = async () => {
  error.value = null;
  const result = await authStore.login(identifier.value, password.value);
  if (result.success) {
    router.push('/'); // Redirect to home on successful login
  } else {
    error.value = 'La connexion a échoué. Veuillez vérifier vos identifiants.';
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
