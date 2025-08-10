document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderContacts();
});

function renderContacts() {
    const contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';
    
    db.users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                <h3><i data-lucide="user" style="color: var(--blue-600);"></i> ${user.title}</h3>
                <p>${user.details}</p>
                <p class="location"><i data-lucide="map-pin" style="width:16px; height:16px;"></i> À proximité</p>
                <footer>
                    <button class="btn-secondary">Contacter</button>
                </footer>
            </div>
        `;
        contactsList.appendChild(card);
    });
    
    lucide.createIcons();
}