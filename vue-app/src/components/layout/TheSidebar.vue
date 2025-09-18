<template>
  <div>
    <div id="lateral-menu" :class="{ 'is-open': isOpen }">
      <button id="close-menu-btn" @click="isOpen = false">&times;</button>
      <ul id="menu-links-container">
        <li v-for="item in menuItems" :key="item.name">
          <router-link :to="item.link.replace('.html', '')">
            <i :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div id="sidebar-overlay" :class="{ 'is-open': isOpen }" @click="isOpen = false"></div>
    <button id="open-menu-btn" @click="isOpen = true">&#9776;</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import menuItems from '@/data/menu.json';

const isOpen = ref(false);
</script>

<style scoped>
/* Basic styles for the sidebar */
#lateral-menu {
  position: fixed;
  left: -250px;
  top: 0;
  width: 250px;
  height: 100%;
  background: #fff;
  transition: left 0.3s ease;
  z-index: 1000;
  border-right: 1px solid #eaeaea;
  padding-top: 3rem; /* Space for close button */
}
#lateral-menu.is-open {
  left: 0;
}
#close-menu-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}
#sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 999;
}
#sidebar-overlay.is-open {
  display: block;
}
#open-menu-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1; /* Below the header */
  background: #fff;
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 4px;
}
#menu-links-container {
    list-style: none;
    padding: 0;
    margin: 0;
}
#menu-links-container a {
    display: block;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    color: #333;
    display: flex;
    align-items: center;
    gap: 1rem;
}
#menu-links-container a:hover {
    background-color: #f4f4f4;
}
</style>
