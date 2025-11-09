// frontend/src/stores/demoStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Ceci est un store Pinia simple pour la démonstration.
 * Un store est un conteneur d'état global qui peut être partagé
 * entre tous les composants de l'application.
 */
export const useDemoStore = defineStore('demo', () => {
  // --- STATE ---
  // L'état est défini avec des refs, comme dans un composant.
  const compteurGlobal = ref(100);

  // --- ACTIONS ---
  // Les actions sont des fonctions qui modifient l'état.
  function incrementer() {
    compteurGlobal.value++;
  }

  function decrementer() {
    compteurGlobal.value--;
  }

  // On expose l'état et les actions pour qu'ils soient utilisables
  // par les composants.
  return {
    compteurGlobal,
    incrementer,
    decrementer,
  };
});
