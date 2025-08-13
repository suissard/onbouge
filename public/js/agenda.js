document.addEventListener('DOMContentLoaded', async () => {
    while (typeof api === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    renderAgenda();
    
    // Gestion des forums (simplified for now)
    document.getElementById('agenda-list').addEventListener('click', (e) => {
        const detailsButton = e.target.closest('.details-btn');
        if (detailsButton) {
            const eventId = detailsButton.getAttribute('data-event-id');
            const container = document.getElementById(`forum-${eventId}`);
            container.classList.toggle('active');
        }
    });
});

async function renderAgenda() {
    const agendaList = document.getElementById('agenda-list');
    agendaList.innerHTML = '';

    try {
        const response = await api.get('events');
        const events = response.data;
        
        events.forEach(event => {
            const hasTopics = event.topics && event.topics.length > 0;
            const participants = event.participants || [];

            const link = document.createElement('a');
            link.href = `event-view.html?id=${event.id}`;
            link.className = 'card-link';

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <h3><i data-lucide="flag" style="color: var(--red-500);"></i> ${event.title}</h3>
                    <span class="date-badge">${new Date(event.date).toLocaleDateString('fr-FR')}</span>
                    <p>${event.description}</p>
                    <p class="location"><i data-lucide="map-pin" style="width:16px; height:16px;"></i> Lieu approximatif</p>
                    <footer>
                        <div class="participants">
                            <span>Participants:</span>
                            <div class="avatar-group">
                                ${participants.map(p => `<div class="avatar">${p}</div>`).join('')}
                            </div>
                        </div>
                        ${hasTopics ?
                            `<button class="btn-secondary details-btn" data-event-id="${event.id}">Voir le forum</button>` :
                            `<span class="no-forum">Aucun forum</span>`
                        }
                    </footer>
                </div>
            `;
            link.appendChild(card);
            agendaList.appendChild(link);
        });

        lucide.createIcons();
    } catch (error) {
        console.error("Error fetching events:", error);
        agendaList.innerHTML = "<p>Erreur de chargement des événements.</p>";
    }
}

function renderForum(container, eventId) {
    const event = db.events.find(e => e.id === eventId);
    if (!event) return;

    // Vérifier si l'événement a des sujets
    const topics = event.topics || [];
    
    const topicsHTML = topics.map(topic => `
        <div class="forum-topic" id="topic-${eventId}-${topic.id}">
            <div class="topic-header" data-topic-id="${topic.id}">
                <span>${topic.title}</span>
                <i data-lucide="chevron-down" class="icon"></i>
            </div>
            <div class="topic-messages">
               <!-- Les messages seront injectés ici au clic -->
            </div>
        </div>
    `).join('');

    // Afficher le formulaire seulement s'il y a des sujets
    const formHTML = topics.length > 0 ? `
        <form class="forum-form" data-event-id="${eventId}">
            <h4>Poster un nouveau message</h4>
            <div class="form-grid">
                <select name="topic" required>
                    <option value="" disabled selected>Choisir un sujet...</option>
                    ${topics.map(t => `<option value="${t.id}">${t.title}</option>`).join('')}
                </select>
                <input name="author" type="text" placeholder="Votre nom" value="Vous" required>
            </div>
            <div class="form-full">
                <input name="text" type="text" placeholder="Écrivez votre message..." required>
                <button type="submit" class="btn-primary"><i data-lucide="send"></i></button>
            </div>
        </form>
    ` : '';

    container.innerHTML = `
        <h4><i data-lucide="messages-square"></i> Sujets de discussion</h4>
        ${topics.length > 0 ? 
            `<div class="topics-list">${topicsHTML}</div>` : 
            `<p class="no-topics">Aucun sujet de discussion pour cet événement</p>`
        }
        ${formHTML}
    `;
    lucide.createIcons();
}

function renderTopicMessages(topicContainer, eventId, topicId) {
    const event = db.events.find(e => e.id === eventId);
    if (!event) return;
    
    const topic = event.topics?.find(t => t.id === topicId);
    if (!topic) return;
        
    let messagesHTML = topic.messages?.map(msg => `
        <div class="forum-message">
            <header><span class="author">${msg.author}</span><span class="date">${msg.date} </span></header>
            <p>${msg.text}</p>
        </div>
    `).join('') || '';

    if (!messagesHTML) {
        messagesHTML = '<p style="padding: 1rem; color: var(--gray-500);">Aucun message dans ce sujet.</p>';
    }

    topicContainer.innerHTML = `<div class="forum-messages-list">${messagesHTML}</div>`;
}

function saveData() {
    // En production, on enverrait les données au serveur ici
    console.log("Données modifiées, devrait être sauvegardées sur le serveur");
}

function handleForumSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const eventId = parseInt(form.getAttribute('data-event-id'), 10);
    const topicId = form.querySelector('select[name="topic"]').value;
    const author = form.querySelector('input[name="author"]').value.trim();
    const text = form.querySelector('input[name="text"]').value.trim();

    if (text && author && topicId && eventId) {
        const event = db.events.find(e => e.id === eventId);
        if (!event) return;
        
        const topic = event.topics?.find(t => t.id === topicId);
        if (!topic) return;
        
        // Initialiser messages si nécessaire
        if (!topic.messages) topic.messages = [];
        
        // Ajouter le nouveau message
        topic.messages.push({
            author: author,
            text: text,
            date: new Date().toISOString().split('T')[0]
        });
        
        saveData();
               
        // Re-rendre uniquement la partie messages du sujet concerné
        const topicMessagesContainer = document.querySelector(`#topic-${eventId}-${topicId} .topic-messages`);
        if (topicMessagesContainer && topicMessagesContainer.classList.contains('active')) {
            renderTopicMessages(topicMessagesContainer, eventId, topicId);
        }

        // Réinitialiser le champ de texte
        form.querySelector('input[name="text"]').value = '';
    }
}


