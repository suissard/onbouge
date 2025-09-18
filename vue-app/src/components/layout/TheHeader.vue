<template>
  <header class="app-header">
    <div class="container">
      <div class="header-top">
        <router-link to="/" class="header-title">SportConnect</router-link>
        <div class="header-actions">
          <template v-if="!authStore.jwt">
            <router-link to="/login" class="btn">
              <!-- <LogInIcon class="icon" /> -->
              <span>Se connecter</span>
            </router-link>
            <router-link to="/register" class="btn btn-primary">S'inscrire</router-link>
          </template>
          <template v-else>
            <span>Bonjour, {{ authStore.user?.username || 'Utilisateur' }}</span>
            <button @click="handleLogout" class="btn">
              <!-- <LogOutIcon class="icon" /> -->
              <span>Se déconnecter</span>
            </button>
          </template>
          <button>
            <!-- <MapPinIcon class="icon" /> -->
            <span>Signaler ma position</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
// import { LogInIcon, LogOutIcon, MapPinIcon } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* Scoped styles for the header component */
.app-header {
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
  padding: 1rem;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: inherit;
}
.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    cursor: pointer;
}
.btn-primary {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}
</style>
