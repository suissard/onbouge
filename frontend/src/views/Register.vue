<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <h1 class="text-center">Register</h1>
        <v-form @submit.prevent="handleSubmit" class="mt-4">
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
            :type="passwordVisible ? 'text' : 'password'"
            required
            :rules="[passwordComplexityRule]"
            :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="passwordVisible = !passwordVisible"
          ></v-text-field>
          <v-text-field
            v-model="passwordConfirmation"
            label="Confirm Password"
            :type="passwordConfirmationVisible ? 'text' : 'password'"
            required
            :rules="[passwordConfirmationRule]"
            :append-inner-icon="passwordConfirmationVisible ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="passwordConfirmationVisible = !passwordConfirmationVisible"
          ></v-text-field>

          <v-list dense>
            <v-list-item :class="{ 'text-success': passwordRules.minLength }">
              <template v-slot:prepend>
                <v-icon>{{ passwordRules.minLength ? 'mdi-check' : 'mdi-close' }}</v-icon>
              </template>
              <v-list-item-title>Au moins 8 caractères</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'text-success': passwordRules.uppercase }">
              <template v-slot:prepend>
                <v-icon>{{ passwordRules.uppercase ? 'mdi-check' : 'mdi-close' }}</v-icon>
              </template>
              <v-list-item-title>Une lettre majuscule</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'text-success': passwordRules.lowercase }">
              <template v-slot:prepend>
                <v-icon>{{ passwordRules.lowercase ? 'mdi-check' : 'mdi-close' }}</v-icon>
              </template>
              <v-list-item-title>Une lettre minuscule</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'text-success': passwordRules.number }">
              <template v-slot:prepend>
                <v-icon>{{ passwordRules.number ? 'mdi-check' : 'mdi-close' }}</v-icon>
              </template>
              <v-list-item-title>Un chiffre</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'text-success': passwordRules.special }">
              <template v-slot:prepend>
                <v-icon>{{ passwordRules.special ? 'mdi-check' : 'mdi-close' }}</v-icon>
              </template>
              <v-list-item-title>Un caractère spécial</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-btn type="submit" color="primary" :disabled="!isFormValid" block>Register</v-btn>
        </v-form>

        <v-divider class="my-4"></v-divider>

        <div class="d-flex justify-center">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-btn disabled class="mx-2" icon="mdi-google" v-bind="props"></v-btn>
            </template>
            <span>Bientôt disponible</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-btn disabled class="mx-2" icon="mdi-facebook" v-bind="props"></v-btn>
            </template>
            <span>Bientôt disponible</span>
          </v-tooltip>
        </div>
      </v-col>
    </v-row>
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
const passwordVisible = ref(false);
const passwordConfirmationVisible = ref(false);
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
const isFormValid = computed(()=> {
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
