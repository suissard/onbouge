document.addEventListener('api-initialized', async () => {
    const topicsContainer = document.getElementById('topics-container');

    if (topicsContainer) {
        try {
            const response = await window.api.get('forum');
            const topics = response.data;

            if (topics && topics.length > 0) {
                const topicsList = document.createElement('ul');
                topicsList.className = 'topics-list';

                topics.forEach(topic => {
                    const topicItem = document.createElement('li');
                    topicItem.innerHTML = `<a href="topic.html?id=${topic.id}">${topic.attributes.title}</a>`;
                    topicsList.appendChild(topicItem);
                });

                topicsContainer.appendChild(topicsList);
            } else {
                topicsContainer.innerHTML = '<p>Aucun sujet de discussion pour le moment.</p>';
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des sujets du forum:', error);
            topicsContainer.innerHTML = '<p>Impossible de charger les sujets du forum. Veuillez réessayer plus tard.</p>';
        }
    }
});
