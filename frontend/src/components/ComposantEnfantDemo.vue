<!--
Ce composant est un "enfant" de VueDemo.vue.
Il illustre comment un composant peut recevoir des données (props)
et comment il peut renvoyer des informations à son parent (emits).
-->
<template>
  <v-card variant="tonal" class="pa-4">
    <h3 class="text-h6">Je suis le Composant Enfant</h3>

    <!-- 1. Props: Affichage d'une donnée reçue du parent -->
    <p class="mt-2">
      Le composant parent m'a envoyé ce titre via une "prop":
      <strong class="text-primary">{{ titre }}</strong>
    </p>

    <!-- 2. Emits: Envoyer une information au parent -->
    <p class="mt-2">
      Je peux communiquer avec mon parent en émettant un événement.
    </p>
    <v-text-field
      v-model="messagePourParent"
      label="Message à envoyer au parent"
      class="mt-2"
    ></v-text-field>
    <v-btn @click="envoyerMessage">Envoyer au Parent</v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// ===================================================================================
// 1. Props (Propriétés)
// `defineProps` est une macro qui déclare les données que ce composant
// s'attend à recevoir de son parent. Ici, il attend une prop "titre" de type String.
// ===================================================================================
defineProps<{
  titre: string;
}>();

// ===================================================================================
// 2. Emits (Événements)
// `defineEmits` déclare les événements que ce composant peut émettre.
// Le parent peut ensuite écouter ces événements avec `v-on` (ou `@`).
// Ici, on déclare un événement "reponse-enfant" qui transportera une chaîne de caractères.
// ===================================================================================
const emit = defineEmits<{
  (e: 'reponse-enfant', message: string): void;
}>();

const messagePourParent = ref('Bonjour du composant enfant !');

// Cette fonction est appelée lors du clic sur le bouton.
// Elle utilise l'émetteur (`emit`) pour déclencher l'événement "reponse-enfant"
// et passe la valeur du champ de texte en paramètre.
function envoyerMessage() {
  emit('reponse-enfant', messagePourParent.value);
}
</script>

<style scoped>
/* Ces styles sont propres à ce composant enfant */
</style>
