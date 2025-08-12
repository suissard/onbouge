// public/js/poi-view.js

document.addEventListener("DOMContentLoaded", async () => {
    // Attend que l'API soit initialisée
    while (typeof api === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const poiId = getURLParameter('id');
    if (!poiId) {
        console.error("No POI ID found in URL");
        document.getElementById('poi-title').textContent = "Point d'intérêt non trouvé";
        return;
    }

    try {
        const poi = await api.get('pois', poiId, { populate: '*' });
        renderPoiDetails(poi);
        if(poi.position) {
            initMap(poi.position, poi.title);
        }
    } catch (error) {
        console.error("Error fetching POI data:", error);
        document.getElementById('poi-title').textContent = "Erreur de chargement";
    }
});

function renderPoiDetails(data) {
    document.getElementById("poi-title").textContent = data.title;
    document.getElementById("poi-description").textContent = data.description;
    document.getElementById("poi-positives").textContent = data.points_positifs;
    document.getElementById("poi-negatives").textContent = data.points_negatifs;
    document.getElementById("poi-author").textContent = data.auteur;
    document.getElementById("poi-tel").textContent = data.tel;

    const webLink = document.getElementById("poi-web");
    if (data.contact_web) {
        webLink.href = data.contact_web;
        webLink.textContent = data.contact_web.replace(/https?:\/\//, "");
    }


    const sportsContainer = document.getElementById("poi-sports");
    sportsContainer.innerHTML = (data.sport || [])
        .map((s) => `<span class="sport-tag">${s}</span>`)
        .join("");

    const favoriteBtn = document.getElementById("favorite-btn");
    favoriteBtn.classList.toggle("active", data.isFavorite);

    favoriteBtn.addEventListener("click", () => {
        data.isFavorite = !data.isFavorite;
        favoriteBtn.classList.toggle("active", data.isFavorite);
    });

    lucide.createIcons();
}

function initMap(position, title) {
    const map = L.map("poi-map").setView(position, 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.marker(position, {
        icon: L.divIcon({
            html: "📍",
            className: "map-emoji-icon",
            iconSize: [24, 24],
        }),
    })
        .addTo(map)
        .bindPopup(title);
}
