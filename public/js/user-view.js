// public/js/user-view.js

document.addEventListener("DOMContentLoaded", async () => {
    // Attend que l'API soit initialisée
    while (typeof api === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const userId = getURLParameter('id');
    if (!userId) {
        console.error("No user ID found in URL");
        document.getElementById('user-name').textContent = "Utilisateur non trouvé";
        return;
    }

    try {
        const user = await api.get('users', userId, { populate: '*' });
        renderUserDetails(user);
        // Assuming the API returns position data in a similar format
        if (user.position && user.position.length >= 2) {
            initMap(user.position[0], user.position[1]);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        document.getElementById('user-name').textContent = "Erreur de chargement";
    }
});

function renderUserDetails(data) {
    document.getElementById("user-name").textContent = data.username;
    document.getElementById("user-description").textContent = data.description;
    document.getElementById("user-role").textContent = data.role;
    document.getElementById("user-privacy").textContent = data.privacy
        ? "Privé"
        : "Public";

    const sportsContainer = document.getElementById("user-sports");
    sportsContainer.innerHTML = (data.sports || [])
        .map((s) => `<span class="sport-tag">${s.replace(".", " ")}</span>`)
        .join("");

    const followBtn = document.getElementById("follow-btn");
    followBtn.classList.toggle("active", data.isFollowed);

    followBtn.addEventListener("click", () => {
        data.isFollowed = !data.isFollowed;
        followBtn.classList.toggle("active", data.isFollowed);
        // Changer l'icône pour mieux refléter l'état
        followBtn.innerHTML = data.isFollowed
            ? '<i data-lucide="user-check" class="icon"></i>'
            : '<i data-lucide="user-plus" class="icon"></i>';
        lucide.createIcons();
    });

    lucide.createIcons();
}

function initMap(homePos, lastPos) {
    const map = L.map("user-map").setView(homePos, 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    L.marker(homePos, { icon: createIcon("🏠") })
        .addTo(map)
        .bindPopup("Domicile");
    L.marker(lastPos, { icon: createIcon("👣") })
        .addTo(map)
        .bindPopup("Dernière position");
}

function createIcon(emoji) {
    return L.divIcon({
        html: emoji,
        className: "map-emoji-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
    });
}
