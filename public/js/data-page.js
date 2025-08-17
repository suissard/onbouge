document.addEventListener('DOMContentLoaded', () => {
    const mindmapContainer = document.getElementById('mindmap-container');
    if (mindmapContainer) {
        const markdown = `
# Données de l'application

## Entités principales
- **Utilisateurs**: Gère les profils, l'authentification, et les préférences.
- **Événements**: Représente les activités sportives, avec des détails comme la date, le lieu, et les participants.
- **Points d'Intérêt (POIs)**: Lieux pertinents pour les sportifs (ex: parcs, salles de sport).

## Relations
- Un **Utilisateur** peut *créer* ou *participer* à plusieurs **Événements**.
- Un **Événement** est *créé par* un **Utilisateur** et peut avoir plusieurs **Participants** (Utilisateurs).
- Un **Événement** a lieu à un **POI**.
- Un **POI** peut accueillir plusieurs **Événements**.

## Données associées
- **Forum**: Discussions liées aux événements ou aux sports.
- **Messages**: Communications directes entre utilisateurs.
- **Notifications**: Alertes pour les invitations, les nouveaux messages, etc.

## Données statiques
- **i18n**: Fichiers de traduction pour l'internationalisation.
- **menu.json**: Structure de la navigation du site.
        `;

        const script = document.createElement('script');
        script.type = 'text/markdown';
        script.textContent = markdown;
        mindmapContainer.appendChild(script);

        const markmapScript = document.createElement('script');
        markmapScript.src = 'https://cdn.jsdelivr.net/npm/markmap-autoloader';
        document.head.appendChild(markmapScript);
    }
});
