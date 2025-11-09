<!--
Ce fichier est une page de démonstration conçue pour les débutants en Vue.js.
Chaque section illustre une fonctionnalité clé du framework avec des explications détaillées.
-->
<template>
  <v-container>
    <v-card class="pa-5">
      <h1 class="text-h4 mb-4">Démonstration des fonctionnalités de Vue.js</h1>

      <!-- =================================================================================== -->
      <!-- SECTION 1: Réactivité de base avec ref() et reactive()                            -->
      <!-- =================================================================================== -->
      <section class="mb-5">
        <h2 class="text-h5 mb-2">1. Réactivité de base</h2>
        <p class="mb-2">
          La réactivité est le cœur de Vue. Elle permet de mettre à jour l'interface utilisateur
          automatiquement lorsque les données changent. On utilise `ref()` pour les valeurs primitives
          (texte, nombre, booléen) et `reactive()` pour les objets.
        </p>
        <!-- `ref()` pour une chaîne de caractères -->
        <p>Message (ref): {{ message }}</p>
        <v-text-field v-model="message" label="Modifier le message"></v-text-field>

        <!-- `reactive()` pour un objet -->
        <p>Utilisateur (reactive): {{ user.name }} - {{ user.age }} ans</p>
        <v-text-field v-model="user.name" label="Modifier le nom"></v-text-field>
        <v-text-field v-model.number="user.age" label="Modifier l'âge" type="number"></v-text-field>
      </section>

      <v-divider class="my-5"></v-divider>

      <!-- =================================================================================== -->
      <!-- SECTION 2: Propriétés calculées (computed)                                        -->
      <!-- =================================================================================== -->
      <section class="mb-5">
        <h2 class="text-h5 mb-2">2. Propriétés Calculées (Computed)</h2>
        <p class="mb-2">
          Une propriété calculée est une valeur qui dépend d'autres données réactives.
          Elle est mise en cache et ne se met à jour que lorsque ses dépendances changent.
          C'est très efficace pour les calculs qui peuvent être lourds.
        </p>
        <p>Message en majuscules : {{ messageEnMajuscules }}</p>
        <p>L'utilisateur est {{ estMajeur }}</p>
      </section>

      <v-divider class="my-5"></v-divider>

      <!-- =================================================================================== -->
      <!-- SECTION 3: Observateurs (watch)                                                     -->
      <!-- =================================================================================== -->
      <section class="mb-5">
        <h2 class="text-h5 mb-2">3. Observateurs (Watch)</h2>
        <p class="mb-2">
          Un observateur permet d'exécuter une fonction chaque fois qu'une donnée spécifique change.
          C'est utile pour des opérations asynchrones ou complexes en réponse à un changement.
        </p>
        <p>Logs des changements du nom :</p>
        <pre class="pa-2 bg-grey-lighten-4 rounded">{{ logNom }}</pre>
      </section>

      <v-divider class="my-5"></v-divider>

      <!-- =================================================================================== -->
      <!-- SECTION 4: Directives courantes                                                     -->
      <!-- =================================================================================== -->
      <section class="mb-5">
        <h2 class="text-h5 mb-2">4. Directives Courantes</h2>

        <!-- v-if, v-else-if, v-else -->
        <h3 class="text-h6 mb-2">v-if, v-else-if, v-else</h3>
        <p class="mb-2">Affiche des blocs de contenu de manière conditionnelle.</p>
        <v-btn @click="nombreAleatoire = Math.random()">Générer un nombre</v-btn>
        <p v-if="nombreAleatoire > 0.75" class="mt-2">Le nombre ({{ nombreAleatoire.toFixed(2) }}) est grand !</p>
        <p v-else-if="nombreAleatoire > 0.25" class="mt-2">Le nombre ({{ nombreAleatoire.toFixed(2) }}) est moyen.</p>
        <p v-else class="mt-2">Le nombre ({{ nombreAleatoire.toFixed(2) }}) est petit.</p>

        <!-- v-for -->
        <h3 class="text-h6 mt-4 mb-2">v-for</h3>
        <p class="mb-2">Affiche une liste d'éléments à partir d'un tableau.</p>
        <v-list>
          <v-list-item v-for="(fruit, index) in fruits" :key="fruit" :title="fruit" :subtitle="`Élément n°${index}`"></v-list-item>
        </v-list>
        <v-text-field v-model="nouveauFruit" label="Ajouter un fruit"></v-text-field>
        <v-btn @click="ajouterFruit">Ajouter</v-btn>

        <!-- v-bind -->
        <h3 class="text-h6 mt-4 mb-2">v-bind (ou :)</h3>
        <p class="mb-2">Lie dynamiquement un attribut HTML à une donnée.</p>
        <v-img :src="urlImage" height="100" class="mb-2"></v-img>
        <v-text-field v-model="urlImage" label="URL de l'image"></v-text-field>

        <!-- v-model -->
        <h3 class="text-h6 mt-4 mb-2">v-model</h3>
        <p class="mb-2">Crée une liaison bidirectionnelle sur les éléments de formulaire.</p>
        <v-checkbox v-model="caseACocher" :label="`La case est ${caseACocher ? 'cochée' : 'décochée'}`"></v-checkbox>
      </section>

      <v-divider class="my-5"></v-divider>

      <!-- =================================================================================== -->
      <!-- SECTION 5: Gestion des événements                                                   -->
      <!-- =================================================================================== -->
      <section class="mb-5">
        <h2 class="text-h5 mb-2">5. Gestion des Événements (@)</h2>
        <p class="mb-2">
          Permet de capturer les interactions de l'utilisateur, comme les clics, et d'exécuter du code.
        </p>
        <p>Compteur : {{ compteur }}</p>
        <v-btn @click="incrementerCompteur">Incrémenter</v-btn>
      </section>

      <v-divider class="my-5"></v-divider>

      <!-- =================================================================================== -->
      <!-- SECTION 6: Composants (Props & Emits)                                               -->
      <!-- =================================================================================== -->
      <section class="mb-5">
        <h2 class="text-h5 mb-2">6. Composants (Props & Emits)</h2>
        <p class="mb-2">
          Les composants sont des morceaux d'interface réutilisables. Le parent leur passe des
          données via les `props` et ils communiquent avec le parent via les `emits`.
        </p>
        <ComposantEnfant
          :titre="titrePourEnfant"
          @reponse-enfant="recevoirMessageEnfant"
        />
        <p v-if="messageDeEnfant">Message reçu de l'enfant : "{{ messageDeEnfant }}"</p>
      </section>

      <v-divider class="my-5"></v-divider>

      <!-- =================================================================================== -->
      <!-- SECTION 8: Intégration avec Pinia (Gestion d'état global)                           -->
      <!-- =================================================================================== -->
      <section class="mb-5">
        <h2 class="text-h5 mb-2">8. Gestion d'état global avec Pinia</h2>
        <p class="mb-2">
          Pinia est le gestionnaire d'état officiel pour Vue. Il permet de partager des données
          de manière centralisée entre tous les composants de l'application, sans avoir à les
          passer manuellement de parent en enfant.
        </p>
        <p>Compteur Global (Pinia): <strong class="text-deep-purple">{{ demoStore.compteurGlobal }}</strong></p>
        <v-btn @click="demoStore.incrementer()" class="mr-2">Incrémenter (Global)</v-btn>
        <v-btn @click="demoStore.decrementer()">Décrémenter (Global)</v-btn>
      </section>

    </v-card>
  </v-container>
</template>

<script setup lang="ts">
// ===================================================================================
// SCRIPT SETUP
// C'est ici que toute la logique du composant est définie en utilisant la Composition API.
// ===================================================================================

import { ref, reactive, computed, watch, onMounted } from 'vue';
import ComposantEnfant from '../components/ComposantEnfantDemo.vue'; // On importe le composant enfant
import { useDemoStore } from '@/stores/demoStore'; // On importe notre store Pinia

// --- 8. Pinia ---
// On instancie le store pour pouvoir l'utiliser dans le composant.
// L'instance est réactive et on peut accéder à son état et ses actions.
const demoStore = useDemoStore();

// --- 1. Réactivité de base ---
// `ref` est utilisé pour les types primitifs (string, number, boolean).
// La valeur est accessible via la propriété `.value` dans le script.
const message = ref('Bonjour Vue.js !');

// `reactive` est utilisé pour les objets.
// Les propriétés sont directement accessibles.
const user = reactive({
  name: 'Alice',
  age: 30,
});

// --- 2. Propriétés Calculées ---
// `computed` crée une valeur qui se met à jour automatiquement
// lorsque ses dépendances (`message` dans ce cas) changent.
const messageEnMajuscules = computed(() => {
  return message.value.toUpperCase();
});

const estMajeur = computed(() => {
  return user.age >= 18 ? 'majeur' : 'mineur';
});

// --- 3. Observateurs ---
// `watch` exécute une fonction lorsque la donnée observée change.
const logNom = ref('');
watch(() => user.name, (nouveauNom, ancienNom) => {
  logNom.value += `Le nom a changé de "${ancienNom}" à "${nouveauNom}".\n`;
});

// --- 4. Directives ---
const nombreAleatoire = ref(Math.random());
const fruits = reactive(['Pomme', 'Banane', 'Cerise']);
const nouveauFruit = ref('');
const urlImage = ref('https://vuejs.org/images/logo.png');
const caseACocher = ref(false);

function ajouterFruit() {
  if (nouveauFruit.value) {
    fruits.push(nouveauFruit.value);
    nouveauFruit.value = ''; // Réinitialiser le champ
  }
}

// --- 5. Gestion des événements ---
const compteur = ref(0);
function incrementerCompteur() {
  compteur.value++;
}

// --- 6. Composants ---
const titrePourEnfant = "Titre envoyé par le parent";
const messageDeEnfant = ref('');

function recevoirMessageEnfant(message: string) {
  messageDeEnfant.value = message;
}

// --- 7. Cycle de vie ---
// `onMounted` est un "hook" de cycle de vie. La fonction passée
// est exécutée juste après que le composant a été ajouté à la page.
onMounted(() => {
  console.log('Le composant VueDemo est monté !');
  // Parfait pour charger des données initiales depuis une API.
});
</script>

<style scoped>
/* Le mot-clé "scoped" signifie que ces styles ne s'appliqueront qu'à ce composant,
   évitant ainsi les conflits avec le reste de votre application. */
section {
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 8px;
}
pre {
  white-space: pre-wrap; /* Pour que le texte aille à la ligne */
}
</style>
