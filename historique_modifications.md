# Historique des Dernières Modifications - Projet OnBouge

Bonjour ! Ce document résume les récentes évolutions techniques du projet. Il est conçu pour t'aider à comprendre la direction actuelle du développement et à te familiariser avec les nouveaux outils.

---

## 🚀 1. Centralisation de la Configuration
**Fichier clé :** [config.json](file:///home/suissard/Bureau/Lien%20vers%20PROGRAMMATION/onbouge/frontend/config.json)

Auparavant, des informations comme l'adresse IP du backend (Strapi) ou les couleurs du thème étaient écrites "en dur" à plusieurs endroits. 
- **Ce qui change :** Tout est désormais regroupé dans `config.json`.
- **Pourquoi ?** C'est plus simple à maintenir. Si l'adresse du serveur change, on ne modifie qu'un seul fichier.
- **Astuce :** Dans le code, on utilise l'alias `@config` pour importer ces données proprement.

## 🖼️ 2. Traitement d'Images Côté Client
**Fichiers clés :** [imageProcessor.ts](file:///home/suissard/Bureau/Lien%20vers%20PROGRAMMATION/onbouge/frontend/src/utils/imageProcessor.ts) & [PhotoUpload.vue](file:///home/suissard/Bureau/Lien%20vers%20PROGRAMMATION/onbouge/frontend/src/components/PhotoUpload.vue)

On a ajouté un système de préparation des photos avant leur envoi au serveur.
- **Ce qui change :** L'utilisateur peut maintenant recadrer, zoomer et ajuster la qualité de sa photo directement via un modal (fenêtre pop-up).
- **Comment ?** Le fichier `imageProcessor.ts` utilise le "Canvas" du navigateur pour transformer l'image localement.
- **Pourquoi ?** On envoie des fichiers moins lourds, ce qui accélère l'application et économise de la place sur le serveur.

## 📝 3. Formulaires Dynamiques Plus Intelligents
**Fichier clé :** [DynamicUpdateForm.vue](file:///home/suissard/Bureau/Lien%20vers%20PROGRAMMATION/onbouge/frontend/src/components/DynamicUpdateForm.vue)

Le composant qui génère nos formulaires s'est enrichi de deux fonctionnalités majeures :
- **La recherche infinie (Infinite Scroll) :** Dans les listes déroulantes, les données ne sont plus chargées toutes d'un coup. Elles arrivent par paquets de 20 au fur et à mesure que l'on fait défiler la liste.
- **Indication des champs requis :** Les champs obligatoires affichent désormais une petite étoile `*` et le bouton "Save" reste bloqué tant que le formulaire n'est pas rempli correctement.

## 🛠️ 4. Sécurisation de l'Installation
**Concept : Prerequiste Checks**

Pour éviter les erreurs incompréhensibles au démarrage du projet, on a ajouté une étape de vérification.
- **Ce qui change :** Un script tourne au début de l'installation pour vérifier que ta version de Node.js et de Docker est la bonne.
- **Pourquoi ?** Ça assure que tout le monde travaille avec le même environnement technique et réduit les bugs inexplicables.

---

### 💡 Conseil pour ton exploration
N'hésite pas à ouvrir les fichiers mentionnés ci-dessus. Le code est commenté pour t'expliquer les détails techniques. Si tu as un doute, la documentation de Vue.js et de Vuetify (notre bibliothèque de composants) sera ta meilleure alliée !

Bon code ! ✌️
