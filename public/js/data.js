// Données fictives pour le projet
let db = {
    events: [],
    pois: [],
    users: []
};

// Charger les données depuis les fichiers JSON
async function loadData() {
    try {
        const eventsResponse = await fetch('data/events.json');
        const poisResponse = await fetch('data/pois.json');
        const usersResponse = await fetch('data/users.json');
        
        db.events = await eventsResponse.json();
        db.pois = await poisResponse.json();
        db.users = await usersResponse.json();
        
        return db;
    } catch (error) {
        console.error('Erreur de chargement des données:', error);
        return { events: [], pois: [], users: [] };
    }
}