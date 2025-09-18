<template>
  <div id="app-wrapper">
    <TheHeader />

    <div class="main-content">
      <TheSidebar />
      <main>
        <router-view></router-view>
      </main>
    </div>

    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from '@/components/layout/TheHeader.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import TheSidebar from '@/components/layout/TheSidebar.vue';
</script>

<style>
/* Global styles */
body {
  font-family: sans-serif;
  margin: 0;
  background-color: #f9f9f9;
}

#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
}

main {
  flex: 1;
  padding: 1.5rem;
  /* Make space for the fixed sidebar button */
  padding-left: 5rem;
}
</style>
