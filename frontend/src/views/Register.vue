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
        :rules="[passwordComplexityRule]"
      ></v-text-field>
      <v-text-field
        v-model="passwordConfirmation"
        label="Confirm Password"
        type="password"
        required
        :rules="[passwordConfirmationRule]"
      ></v-text-field>

      <v-list dense>
        <v-list-item :class="{ 'text-success': passwordRules.minLength }">
          <v-icon>{{ passwordRules.minLength ? 'mdi-check' : 'mdi-close' }}</v-icon>
          Au moins 8 caractères
        </v-list-item>
        <v-list-item :class="{ 'text-success': passwordRules.uppercase }">
          <v-icon>{{ passwordRules.uppercase ? 'mdi-check' : 'mdi-close' }}</v-icon>
          Une lettre majuscule
        </v-list-item>
        <v-list-item :class="{ 'text-success': passwordRules.lowercase }">
          <v-icon>{{ passwordRules.lowercase ? 'mdi-check' : 'mdi-close' }}</v-icon>
          Une lettre minuscule
        </v-list-item>
        <v-list-item :class="{ 'text-success': passwordRules.number }">
          <v-icon>{{ passwordRules.number ? 'mdi-check' : 'mdi-close' }}</v-icon>
          Un chiffre
        </v-list-item>
        <v-list-item :class="{ 'text-success': passwordRules.special }">
          <v-icon>{{ passwordRules.special ? 'mdi-check' : 'mdi-close' }}</v-icon>
          Un caractère spécial
        </v-list-item>
      </v-list>

      <v-btn type="submit" color="primary" :disabled="!isFormValid">Register</v-btn>
    </v-form>

    <v-divider class="my-4"></v-divider>

    <div class="d-flex flex-column align-center">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <div v-bind="props">
            <v-btn disabled class="mb-2" color="primary" width="300px">S'inscrire avec Google</v-btn>
          </div>
        </template>
        <span>Bientôt disponible</span>
      </v-tooltip>
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <div v-bind="props">
            <v-btn disabled color="primary" width="300px">S'inscrire avec Facebook</v-btn>
          </div>
        </template>
        <span>Bientôt disponible</span>
      </v-tooltip>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const error = ref<string | null>(null);
const router = useRouter();
const authStore = useAuthStore();

/**
 * A computed property that checks if the password meets all complexity requirements.
 */
const passwordRules = computed(() => {
  const value = password.value;
  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
  };
});

/**
 * A computed property that returns true if the password meets all complexity criteria.
 */
const isPasswordComplex = computed(() => {
  const rules = passwordRules.value;
  return Object.values(rules).every(Boolean);
});

/**
 * A computed property that returns true if the password and password confirmation match.
 */
const isPasswordConfirmed = computed(() => {
  return password.value === passwordConfirmation.value && password.value !== '';
});

/**
 * A computed property that returns true if the entire form is valid.
 */
const isFormValid = computed(() => {
  return isPasswordComplex.value && isPasswordConfirmed.value && username.value !== '' && email.value !== '';
});

/**
 * A validation rule for the password complexity.
 * @returns {boolean | string} - True if the password is complex, otherwise an error message.
 */
const passwordComplexityRule = () => isPasswordComplex.value || 'Le mot de passe ne respecte pas les critères de complexité.';

/**
 * A validation rule for the password confirmation.
 * @returns {boolean | string} - True if the passwords match, otherwise an error message.
 */
const passwordConfirmationRule = () => isPasswordConfirmed.value || 'Les mots de passe ne correspondent pas.';

/**
 * Handles the registration form submission.
 * It calls the auth store's register action and redirects to the homepage on success.
 * If the registration fails, it displays an error message.
 */
const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs et vous assurer que le mot de passe respecte les critères de complexité.';
    return;
  }

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

<style scoped>
.text-success {
  color: green;
}
</style>
