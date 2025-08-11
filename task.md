# Plan d'action pour rendre les pages de détails dynamiques (Instructions pour Agent IA)

**Objectif :** Modifier l'application pour que les pages `user-view.html`, `event-view.html`, et `poi-view.html` chargent dynamiquement leur contenu depuis l'API en utilisant un `id` passé en paramètre d'URL.

**Contexte :** Actuellement, ces pages contiennent des données statiques en dur et les pages de listes (`users.html`, etc.) ne créent pas de liens corrects vers elles. Ce plan ne modifie que les scripts, pas la structure HTML.

---

### Tâche 1 : Créer une fonction utilitaire pour les paramètres d'URL

1.  **Action :** Lire le fichier `public/js/main.js` pour obtenir son contenu actuel.
2.  **Action :** Utiliser l'outil `replace_with_git_merge_diff` pour ajouter la fonction `getURLParameter` suivante au début du fichier `public/js/main.js`, juste après la déclaration `let api;`.

    ```javascript
    /**
     * Récupère la valeur d'un paramètre dans l'URL.
     * @param {string} name - Le nom du paramètre à récupérer.
     * @returns {string|null} - La valeur du paramètre ou null s'il n'est pas trouvé.
     */
    function getURLParameter(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }
    ```

3.  **Vérification :** Lire à nouveau le fichier `public/js/main.js` pour confirmer que la fonction a été ajoutée correctement.

---

### Tâche 2 : Rendre la logique de `user-view.html` dynamique

1.  **Action :** Créer un nouveau fichier nommé `public/js/user-view.js`.
2.  **Action :** Remplir `public/js/user-view.js` avec un script qui :
    - Attend que l'objet global `api` soit disponible.
    - Utilise `getURLParameter('id')` pour obtenir l'ID de l'utilisateur.
    - Appelle `api.get('users', userId, { populate: '*' })` pour récupérer les données.
    - Injecte dynamiquement les données de l'utilisateur dans les éléments HTML de `user-view.html` (ex: `document.getElementById('user-name').textContent = user.username;`). La logique de rendu doit être basée sur le script inline précédemment existant dans `user-view.html`.
3.  **Action :** Lire le fichier `public/user-view.html`.
4.  **Action :** Utiliser `replace_with_git_merge_diff` pour supprimer le bloc `<script>` inline à la fin de `public/user-view.html` et le remplacer par la ligne `<script src="js/user-view.js"></script>`.

---

### Tâche 3 : Rendre la logique de `event-view.html` dynamique

1.  **Action :** Répéter le processus de la Tâche 2 pour `event-view.html`.
2.  **Action :** Créer `public/js/event-view.js` avec la logique appropriée pour les événements (appel à `api.get('events', eventId, ...)`).
3.  **Action :** Modifier `public/event-view.html` pour supprimer son script inline et le remplacer par `<script src="js/event-view.js"></script>`.

---

### Tâche 4 : Rendre la logique de `poi-view.html` dynamique

1.  **Action :** Répéter le processus de la Tâche 2 pour `poi-view.html`.
2.  **Action :** Créer `public/js/poi-view.js` avec la logique appropriée pour les POIs (appel à `api.get('pois', poiId, ...)`).
3.  **Action :** Modifier `poi-view.html` pour supprimer son script inline et le remplacer par `<script src="js/poi-view.js"></script>`.

---

### Tâche 5 : Mettre à jour les scripts des pages de liste

1.  **Pour `users.html` :**
    *   **Action :** Modifier le script inline dans `users.html`.
    *   **Logique à implémenter :** Remplacer le chargement de données statiques (`db.users`) par un appel `await api.get('users')`. Dans la boucle de rendu, chaque carte utilisateur doit être enveloppée dans une balise `<a>` avec un `href` pointant vers `user-view.html?id=${user.id}`.

2.  **Pour `events.html` :**
    *   **Action :** Modifier le fichier `public/js/agenda.js`.
    *   **Logique à implémenter :** Remplacer le chargement depuis `db.events` par `await api.get('events')`. Dans la boucle de rendu, chaque carte d'événement doit être enveloppée dans une balise `<a>` avec un `href` pointant vers `event-view.html?id=${event.id}`.
    *   **Action :** Modifier `events.html` pour supprimer la balise `<script src="js/data.js"></script>`.

3.  **Pour `pois.html` :**
    *   **Action :** Modifier le script inline dans `pois.html`.
    *   **Logique à implémenter :** Remplacer le chargement de données statiques par des appels `Promise.all` à `api.get` pour `users`, `events`, et `pois`. Dans la fonction `createSidebarItem`, l'élément généré doit être un lien `<a>` avec un `href` dynamique basé sur le type d'objet (ex: `user-view.html?id=...`, `event-view.html?id=...`).

---

### Tâche 6 : Vérification finale

1.  **Action :** Lire tous les fichiers modifiés (`main.js`, les 3 fichiers `*-view.js`, `users.html`, `events.html`, `agenda.js`, `pois.html`) pour s'assurer que les modifications ont été appliquées comme prévu.
2.  **Validation :** Confirmer que les dépendances à `data.js` et les scripts inline statiques ont été complètement supprimés des pages concernées.
