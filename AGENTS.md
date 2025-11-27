# Documentation pour les Agents IA (AGENTS.md)

Ce fichier est destiné aux agents IA travaillant sur ce projet. Il décrit la structure du projet, les flux de données et les effets de bord à anticiper lors des modifications.

## Structure du Projet

Le projet est divisé en deux parties principales :
- **frontend/** : Application Vue.js.
- **install/strapi/** : Configuration et scripts pour le backend Strapi.

## Flux de Données et Synchronisation Strapi

La cohérence des données entre le backend Strapi et le frontend est critique. Une modification dans l'un des maillons de la chaîne nécessite souvent des mises à jour en cascade.

### La Chaîne de Dépendance

`frontend/src/data` <=> `frontend/src/interfaces` <=> `frontend/src/stores/strapiStore.ts` <=> `install/strapi/schemas`

1.  **Schémas Strapi (`install/strapi/schemas/*.json`)**
    -   **Rôle** : Définition de la structure de la base de données et de l'API Strapi.
    -   **Source de Vérité** : C'est le point de départ. Si un champ change ici, tout le reste doit suivre.

2.  **Interfaces Frontend (`frontend/src/interfaces/*.ts`)**
    -   **Rôle** : Typage TypeScript pour le frontend.
    -   **Contrainte** : Doit correspondre EXACTEMENT aux schémas Strapi (noms des champs, types).
    -   **Effet de bord** : Si une interface est incorrecte, TypeScript ne détectera pas les erreurs d'API, ou `strapiStore` échouera silencieusement ou avec des erreurs de runtime.

3.  **Stores Pinia (`frontend/src/stores/strapiStore.ts`)**
    -   **Rôle** : Gestion de l'état et communication avec l'API Strapi.
    -   **Fonctionnement** : Utilise les interfaces pour typer les données.
    -   **Effet de bord** : Bien que générique, vérifiez si des logiques spécifiques (comme `populate: '*'`) sont affectées par des changements de relations dans les schémas.

4.  **Données Statiques / Seed (`frontend/src/data/*.json`)**
    -   **Rôle** : Données utilisées pour le "seeding" (remplissage initial) de la base de données Strapi et parfois comme données mock.
    -   **Contrainte** : Doit respecter la structure définie dans les schémas ET les interfaces.
    -   **Effet de bord** : Si vous changez un schéma mais pas le fichier JSON correspondant, le script de seed (`install/strapi/seed.js`) échouera ou insérera des données corrompues.

## Workflow de Modification (Checklist)

Si vous devez ajouter ou modifier un champ (ex: ajouter `altitude` à `Poi`) :

1.  [ ] **Backend** : Modifiez le schéma JSON dans `install/strapi/schemas/poi.json`.
2.  [ ] **Frontend Interface** : Ajoutez le champ dans `frontend/src/interfaces/poi.ts`.
3.  [ ] **Frontend Data** : Mettez à jour `frontend/src/data/pois.json` pour inclure ce champ dans les données de test/seed.
4.  [ ] **Frontend View** : Mettez à jour les composants Vue (ex: `PoiEdit.vue`) pour afficher/éditer ce champ.
5.  [ ] **Validation** : Vérifiez que `npm run seed` fonctionne avec la nouvelle structure.

## Points d'Attention Spécifiques

-   **Relations** : Les relations (OneToMany, ManyToOne) sont définies dans les schémas. Assurez-vous que les interfaces reflètent ces relations (souvent via des tableaux d'objets ou des IDs).
-   **Decorators** : Les interfaces utilisent souvent des décorateurs (ex: `@FormField`) pour générer automatiquement les formulaires. N'oubliez pas de les mettre à jour si vous changez un champ.
-   **DocumentId** : Strapi 5 utilise `documentId` comme identifiant public stable, et non `id` (numérique). Les interfaces et stores doivent gérer `documentId`.
