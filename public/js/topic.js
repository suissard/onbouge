document.addEventListener('api-initialized', async () => {
    const topicTitle = document.getElementById('topic-title');
    const messagesContainer = document.getElementById('messages-container');
    const newMessageForm = document.getElementById('new-message-form');
    const messageText = document.getElementById('message-text');

    const topicId = getURLParameter('id');

    if (topicId) {
        try {
            const response = await window.api.get('forum', topicId);
            const topic = response.data;

            if (topic) {
                topicTitle.textContent = topic.attributes.title;

                if (topic.attributes.messages && topic.attributes.messages.length > 0) {
                    const messagesList = document.createElement('ul');
                    messagesList.className = 'messages-list';

                    topic.attributes.messages.forEach(message => {
                        const messageItem = document.createElement('li');
                        messageItem.innerHTML = `
                            <div class="message-author">${message.author}</div>
                            <div class="message-text">${message.text}</div>
                            <div class="message-date">${new Date(message.date).toLocaleString()}</div>
                        `;
                        messagesList.appendChild(messageItem);
                    });

                    messagesContainer.appendChild(messagesList);
                } else {
                    messagesContainer.innerHTML = '<p>Aucun message dans ce sujet pour le moment.</p>';
                }
            } else {
                topicTitle.textContent = 'Sujet non trouvé';
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du sujet:', error);
            topicTitle.textContent = 'Erreur de chargement';
        }
    } else {
        topicTitle.textContent = 'Aucun sujet sélectionné';
    }

    if (newMessageForm) {
        newMessageForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const text = messageText.value.trim();

            if (text) {
                try {
                    const newMessage = {
                        author: 'Utilisateur', // This should be replaced with the actual user
                        text: text,
                        date: new Date().toISOString()
                    };

                    // In a real scenario, we would update the topic on the server
                    // For now, we just add it to the page
                    const messagesList = messagesContainer.querySelector('.messages-list');
                    const messageItem = document.createElement('li');
                    messageItem.innerHTML = `
                        <div class="message-author">${newMessage.author}</div>
                        <div class="message-text">${newMessage.text}</div>
                        <div class="message-date">${new Date(newMessage.date).toLocaleString()}</div>
                    `;
                    messagesList.appendChild(messageItem);

                    messageText.value = '';

                    // In a real application, you would call api.put or api.post here.
                    // For example:
                    // const response = await api.put('forum', topicId, {
                    //     messages: [
                    //         ...topic.attributes.messages,
                    //         newMessage
                    //     ]
                    // });
                } catch (error) {
                    console.error('Erreur lors de l\'envoi du message:', error);
                }
            }
        });
    }
});
