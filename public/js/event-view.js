// public/js/event-view.js

document.addEventListener("DOMContentLoaded", async () => {
    // Attend que l'API soit initialisée
    while (typeof api === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const eventId = getURLParameter('id');
    if (!eventId) {
        console.error("No event ID found in URL");
        document.getElementById('event-title').textContent = "Événement non trouvé";
        return;
    }

    try {
        const event = await api.get('events', eventId, { populate: '*' });
        renderEventDetails(event);
        renderForum(event.topics || []);
        if(event.position) {
            initMap(event.position, event.title);
        }

    } catch (error) {
        console.error("Error fetching event data:", error);
        document.getElementById('event-title').textContent = "Erreur de chargement";
    }
});

function renderEventDetails(data) {
    document.getElementById("event-title").textContent = data.title;
    document.getElementById("event-description").textContent = data.description;
    document.querySelector("#event-date span").textContent = new Date(data.date).toLocaleDateString('fr-FR');
    document.querySelector("#event-type span").textContent = data.type;

    const sportsContainer = document.getElementById("event-sports");
    sportsContainer.innerHTML = (data.sport || [])
        .map((s) => `<span class="sport-tag">${s.replace(".", " ")}</span>`)
        .join("");

    document.getElementById("public-participants").textContent = data.nb_users_public || 0;
    document.getElementById("anon-participants").textContent = data.nb_users_anonymes || 0;

    const avatarContainer = document.getElementById("avatar-group");
    avatarContainer.innerHTML = (data.participants || [])
        .map((p) => `<div class="avatar">${p}</div>`)
        .join("");

    const favoriteBtn = document.getElementById("favorite-btn");
    favoriteBtn.classList.toggle("active", data.isFavorite);

    favoriteBtn.addEventListener("click", () => {
        data.isFavorite = !data.isFavorite;
        favoriteBtn.classList.toggle("active", data.isFavorite);
    });

    lucide.createIcons();
}

function renderForum(topics) {
    const topicsContainer = document.getElementById("forum-topics");
    topicsContainer.innerHTML = topics
        .map(
            (topic) => `
    <div class="forum-topic">
        <div class="topic-header">
            <span>${topic.title}</span>
            <i data-lucide="chevron-down" class="icon"></i>
        </div>
        <div class="topic-messages">
            <div class="forum-messages-list">
                ${(topic.messages || [])
                    .map(
                        (msg) => `
                    <div class="forum-message">
                        <header><span class="author">${
                            msg.author
                        }</span><span>${new Date(msg.date).toLocaleDateString(
                    "fr-FR"
                )}</span></header>
                        <p>${msg.text}</p>
                    </div>`
                    )
                    .join("")}
            </div>
            <form class="forum-form" style="margin-top: 1rem;">
                <div class="form-full">
                    <input type="text" placeholder="Écrire un message..." required>
                    <button type="submit" class="btn-secondary">Envoyer</button>
                </div>
            </form>
        </div>
    </div>`
        )
        .join("");

    document.querySelectorAll(".topic-header").forEach((header) => {
        header.addEventListener("click", () => {
            header.classList.toggle("active");
            header.nextElementSibling.classList.toggle("active");
        });
    });
}

function initMap(position, title) {
    const map = L.map("event-map").setView(position, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.marker(position).addTo(map).bindPopup(title).openPopup();
}
