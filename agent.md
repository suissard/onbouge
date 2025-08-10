# Guide pour l'Agent IA

Bonjour Agent !

Ce document a pour but de te guider dans tes tâches de développement sur ce projet. Merci de lire attentivement et de suivre ces directives pour assurer la qualité et la cohérence du code.

## 1. Principes Généraux

- **Comprendre avant d'agir** : Avant de modifier le code, assure-toi de bien comprendre la demande et d'explorer la base de code existante.
- **Tester systématiquement** : Toute modification ou ajout de fonctionnalité doit être accompagné de tests pertinents. Assure-toi que tous les tests (anciens et nouveaux) passent avant de soumettre ton travail.
- **Code propre et maintenable** : Écris du code simple, lisible et bien documenté. Respecte les conventions de style du projet.

## 2. Structure du Projet

*Bien que cette section doive être adaptée au projet, voici un exemple de structure courante.*

- `src/` : Contient le code source de l'application.
- `tests/` ou `specs/` : Contient les tests unitaires et d'intégration.
- `docs/` : Contient la documentation du projet.
- `scripts/` : Contient divers scripts utiles pour l'automatisation.
- `package.json`, `requirements.txt`, `pom.xml`, etc. : Fichiers de gestion des dépendances.

## 3. Mise en Place de l'Environnement

Pour installer les dépendances du projet, utilise la commande appropriée. Par exemple :

- Pour un projet Node.js : `npm install`
- Pour un projet Python : `pip install -r requirements.txt`
- Pour un projet Java Maven : `mvn install`

Assure-toi que l'environnement est correctement configuré avant de commencer à travailler.

## 4. Exécution des Tests

Pour lancer la suite de tests, utilise la commande définie dans le projet. Par exemple :

- Pour un projet Node.js : `npm test`
- Pour un projet Python avec pytest : `pytest`
- Pour un projet Java Maven : `mvn test`

Ne soumets jamais de code si les tests échouent.

## 5. Style de Code et Conventions

- **Nommage** : Utilise des noms de variables et de fonctions clairs et explicites.
- **Formatage** : Si un formateur de code (comme Prettier, Black, etc.) est présent, utilise-le pour formater ton code avant de le soumettre.
- **Messages de Commit** : Rédige des messages de commit clairs et concis, en suivant si possible la convention [Conventional Commits](https://www.conventionalcommits.org/).
  - *Exemple :* `feat: Ajout de la fonctionnalité d'authentification`
  - *Exemple :* `fix: Correction d'un bug dans le calcul du panier`

## 6. Checklist avant de soumettre

Avant de finaliser ton travail avec `submit`, vérifie les points suivants :

1.  [ ] Le code que j'ai écrit résout bien le problème demandé.
2.  [ ] J'ai ajouté des tests pour mes nouvelles fonctionnalités ou corrections.
3.  [ ] Tous les tests passent avec succès.
4.  [ ] Le code est propre, lisible et respecte les conventions du projet.
5.  [ ] J'ai supprimé le code de débogage (ex: `console.log`).
6.  [ ] Le message de commit est clair et descriptif.

Bon courage !
