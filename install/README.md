# Guide d'installation

Ce dossier contient des outils pour faciliter l'installation et la configuration de l'application.

## Configuration des Ports (Docker)

Pour éviter les conflits avec des services existants (comme un serveur Caddy déjà installé), vous pouvez modifier les ports exposés par Docker en créant ou modifiant le fichier `.env` à la racine du projet :

```env
# Ports par défaut : 80, 443, 3000, 1337
CADDY_HTTP_PORT=8080
CADDY_HTTPS_PORT=8443
CADDY_FRONT_PORT=3001
CADDY_API_PORT=1338
```

Ensuite, relancez les conteneurs :
```bash
docker compose up -d
```

## Configuration Caddy Externe

Si vous disposez déjà d'un serveur Caddy sur la machine hôte et que vous ne souhaitez pas utiliser celui de Docker pour le routage principal, vous pouvez utiliser le snippet fourni dans `install/caddy/Caddyfile.snippet`.

1.  Copiez le contenu de `install/caddy/Caddyfile.snippet` dans votre `Caddyfile` principal.
2.  Adaptez les domaines et les adresses IP/ports des `reverse_proxy` pour pointer vers les conteneurs Docker (ou les ports exposés sur l'hôte).

## Création des Schémas Strapi

Pour créer automatiquement les types de contenu (Collection Types) dans Strapi correspondant aux données du frontend :

1.  Allez dans le dossier `install/strapi` :
    ```bash
    cd install/strapi
    ```
2.  Lancez le script d'installation des schémas :
    ```bash
    node install_schemas.js
    ```
    *Note : Ce script écrit directement dans le dossier `data_strapi` monté dans le conteneur Docker.*

3.  Redémarrez le conteneur Strapi pour prendre en compte les changements :
    ```bash
    docker compose restart strapi
    ```

## Initialisation des Données Strapi (Optionnel)

Si vous souhaitez ensuite peupler ces schémas avec des données de test :

1.  Assurez-vous que Strapi est lancé et accessible.
2.  Installez les dépendances si ce n'est pas fait :
    ```bash
    npm install
    ```
3.  Lancez le script de seed :
    ```bash
    node seed.js
    ```

