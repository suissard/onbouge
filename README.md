# Rally Point 🎯

**Rally Point** est une application web conçue pour connecter les amateurs de sport. Elle permet de trouver des lieux, de participer à des événements et de créer une communauté autour de passions sportives communes. L'application est pensée pour être proactive en suggérant des activités pour stimuler les rencontres.

---

## ✨ Fonctionnalités Clés

- **Profils Utilisateurs :** Chaque utilisateur dispose d'un profil avec ses sports, son niveau et son matériel.
- **Authentification Complète :** Inscription et connexion via email/mot de passe ou des fournisseurs sociaux (Google, Facebook).
- **Événements & Lieux (POI) :** Les utilisateurs peuvent créer et consulter des événements (amicaux, compétitions) et des lieux de pratique.
- **Événements Suggérés :** L'application génère des suggestions d'événements pour encourager l'organisation communautaire via un système de vote.
- **Contexte Social :** L'application garde en mémoire les personnes "croisées" lors d'événements pour aider à tisser des liens.
- **Menu Dynamique :** La navigation est gérée via un menu latéral dont le contenu est fourni par l'API Strapi.
- **Application "Single Page" (SPA) :** La navigation est fluide et rapide, le contenu des pages est chargé dynamiquement sans recharger toute la page.

---

## 🛠️ Stack Technique

L'ensemble de l'application est conçu pour être lancé via Docker.

### Frontend

- **Architecture :** L'application suit un modèle de "coquille applicative" (App Shell). Le fichier `index.html` est minimaliste et sert de point d'entrée.
- **Point d'entrée :** Le script principal `js/main.js` orchestre le chargement de l'application.
- **Chargement dynamique :** Les composants de l'interface (en-tête, pied de page, menu latéral) sont chargés dynamiquement en JavaScript via `fetch` à partir de fichiers HTML partiels situés dans le dossier `/partials`.
- **Logique :** JavaScript natif (Vanilla JS) est utilisé pour toute la logique cliente, y compris les appels à l'API Strapi.
- **Style :** [Tailwind CSS](https://tailwindcss.com/) pour un design rapide et moderne.
- **Icônes :** [Font Awesome](https://fontawesome.com/).

### Backend

- **CMS Headless :** [Strapi](https://strapi.io/) pour la gestion de contenu et l'API.
- **Base de données :** [MySQL](https://www.mysql.com/).
- **Serveur Web :** Un serveur léger (ex: Nginx ou Caddy) pour servir les fichiers statiques du frontend.

---

## 🚀 Installation et Lancement

L'ensemble de l'environnement de développement est géré par Docker et Docker Compose.

1. **Prérequis :** Assurez-vous d'avoir [Docker](https://www.docker.com/products/docker-desktop/) installé sur votre machine.
2. **Lancement :**
   Naviguez dans le dossier `INSTALL/` à la racine du projet et lancez la commande suivante :

   ````
   ```bash
       docker-compose up -d
           ```
   
               Cette commande va construire les images et démarrer tous les conteneurs nécessaires en arrière-plan :
                   -   Le **serveur web** pour le frontend.
                       -   Le **serveur Strapi** pour l'API.
                           -   La base de données **MySQL**.
   
                           3.  **Accès aux services :**
                               -   **Application Frontend :** `http://localhost:3000` (ou le port que vous avez configuré)
                                   -   **Administration Strapi :** `http://localhost:1337/admin`
                                       -   **API Strapi :** `http://localhost:1337/api`
   
                                       ---
   
                                       ## 📋 Structure du Projet

Le projet est organisé comme suit :

-   **`/public`** : Contient tous les fichiers statiques du frontend.
    -   **`index.html`** : La "coquille" de l'application. Ce fichier est très léger.
    -   **`/js`** : Contient les scripts JavaScript.
        -   `main.js` : Le script principal qui initialise l'application, charge les composants et gère la logique globale.
        -   `/Core` : Contient les classes et fonctions essentielles, comme le client API pour Strapi.
    -   **`/css`** : Contient les feuilles de style.
    -   **`/partials`** : Des morceaux d'interface utilisateur (comme `header.html`, `footer.html`, `sidebar.html`) qui sont chargés dynamiquement par JavaScript.
    -   **`/data`** : Fichiers JSON statiques utilisés pour peupler certaines parties de l'interface, comme le menu de navigation.
-   **`/src`** : Contient la configuration et les API du backend Strapi.
-   **`docker-compose.yml`** : Le fichier qui définit et orchestre les conteneurs Docker pour l'environnement de développement (frontend, backend, base de données).
-   **`package.json`** : Définit les dépendances du projet (principalement pour les tests) et les scripts pour gérer l'environnement Docker.

---

## 🧪 Tests

Ce projet est équipé d'une suite de tests automatisés utilisant [Vitest](https://vitest.dev/) et [JSDOM](https://github.com/jsdom/jsdom).

### Philosophie

Les tests sont conçus pour être **rapides et fiables**. Ils s'exécutent dans un environnement Node.js simulé et **n'ont pas besoin que l'environnement Docker (Strapi, base de données) soit lancé**.

Toutes les interactions avec l'API Strapi sont interceptées et simulées (mockées) pour garantir des résultats prévisibles et éviter les dépendances externes.

### Lancer les tests

Pour lancer la suite de tests, exécutez la commande suivante à la racine du projet :

```bash
npm install
npm test
```

### Ajouter de nouveaux tests

1.  Créez un nouveau fichier de test avec l'extension `.test.js` à la racine du projet.
2.  Importez les outils de Vitest (`describe`, `it`, `expect`).
3.  Lorsque vous instanciez ou importez `StrapiApi`, le mock défini dans `tests/mocks/strapiApi.js` sera automatiquement utilisé.
4.  Vous pouvez modifier les données de test en éditant les fichiers JSON dans le répertoire `tests/strapi-import/`.