# Consignes pour les Agents IA

Ce document contient les directives fondamentales pour les agents IA travaillant sur ce projet. Le respect de ces règles est essentiel pour garantir la qualité, la maintenabilité et la robustesse du code.

---

### **1. Phase de Compréhension et Planification : "Mesurer dix fois, couper une fois"**

1.  **Ne Jamais Faire d'Hypothèses :** Avant d'écrire la moindre ligne de code, assure-toi d'avoir une compréhension parfaite de la demande. Pose des questions de clarification à l'utilisateur (`request_user_input`) jusqu'à ce que tous les doutes soient levés. Reformule la tâche avec tes propres mots pour confirmer.
2.  **Explorer Avant d'Agir :** Commence toujours par une phase d'exploration du code existant. Utilise `list_files -R` pour cartographier le projet, et `grep` pour localiser les fichiers et les logiques pertinentes. Lis attentivement les fichiers `README.md` et, surtout, `AGENTS.md` qui peuvent contenir des instructions cruciales spécifiques au projet.
3.  **Créer un Plan Détaillé :** Formalise ta stratégie dans un plan (`set_plan`). Ce plan doit décomposer la tâche en étapes logiques et granulaires. Par exemple : "1. Ajouter la fonction `X` dans le fichier `Y.ts`. 2. Créer un test unitaire pour cette fonction dans `Y.test.ts`. 3. Mettre à jour la documentation. 4. Lancer les tests de non-régression."

### **2. Phase de Développement : "Écrire du code pour les humains, pas seulement pour les machines"**

1.  **Respecter le Style Existant :** Le code doit être cohérent. Avant d'écrire, observe le style de code, les conventions de nommage et l'architecture déjà en place dans les fichiers que tu modifies.
2.  **Modifier la Source, pas les Artefacts :** Ne modifie jamais directement les fichiers générés (dans des dossiers comme `dist/`, `build/`, `public/`). Trouve toujours le fichier source (`.ts`, `.vue`, `.scss`, etc.) et modifie-le. Ensuite, utilise les commandes de build appropriées (`npm run build`).
3.  **Changements Atomiques et Vérifiables :** Effectue des modifications petites et ciblées. Après chaque modification (un `overwrite_file_with_block` ou `replace_with_git_merge_diff`), **vérifie systématiquement** que le changement a été appliqué correctement en utilisant `read_file`. C'est une étape non négociable.

### **3. Phase de Test et Vérification : "Ne Jamais Faire Confiance, Toujours Vérifier"**

1.  **Le Test est Roi :** Pour toute nouvelle fonctionnalité, écris un test. Pour toute correction de bug, écris un test qui échoue avant la correction et qui passe après.
2.  **Identifier et Lancer les Tests Pertinents :** Recherche les suites de tests existantes qui couvrent la zone de code que tu modifies. Lance-les pour t'assurer que tes changements n'ont pas cassé de fonctionnalités existantes (régression).
3.  **Vérification de Bout en Bout (`End-to-End`) :** Pour les changements frontend, ne te contente pas de tests unitaires. Utilise les outils de vérification frontend (comme Playwright) pour simuler une interaction utilisateur et fournir une preuve visuelle (screenshot) que le changement fonctionne comme prévu.
4.  **Build Frontend Avant de Commiter :** Avant chaque commit, il est impératif de lancer la commande `cd frontend && npm run build` pour s'assurer que l'application frontend se construit sans erreur.
5.  **Suivre les Instructions de Pré-Commit :** Utilise systématiquement `pre_commit_instructions` avant de soumettre. Cette étape garantit que toutes les vérifications de qualité (linting, build, tests) définies pour le projet sont passées avec succès.

### **4. Communication et Itération**

1.  **Communiquer Proactivement :** Informe l'utilisateur de ton avancement, surtout si tu rencontres un obstacle. Explique les problèmes que tu as rencontrés et les solutions que tu as essayées.
2.  **Ne Pas Rester Bloqué :** Si après plusieurs tentatives tu n'arrives pas à résoudre un problème, demande de l'aide à l'utilisateur. Il vaut mieux demander une orientation que de produire une solution de mauvaise qualité.
