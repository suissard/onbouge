document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.dynamic-link-container');

    const populateSelector = async (container) => {
        const selector = container.querySelector('.id-selector');
        const dataType = selector.dataset.type;
        if (!dataType) return;

        try {
            const response = await fetch(`data/${dataType}.json`); // Path is relative to liens.html
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Clear "Loading..." option and add a default prompt
            selector.innerHTML = '<option value="">-- Choisissez un élément --</option>';

            // Populate with data
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;

                let displayText = item.title; // Default for pois and events
                if (dataType === 'users') {
                    displayText = `${item.prenom} ${item.nom}`;
                }

                option.textContent = `${displayText} (ID: ${item.id})`;
                selector.appendChild(option);
            });

        } catch (error) {
            console.error(`Could not load data for ${dataType}:`, error);
            selector.innerHTML = '<option value="">Erreur de chargement</option>';
        }
    };

    const setupContainer = (container) => {
        populateSelector(container);

        container.querySelectorAll('.go-btn').forEach(button => {
            button.addEventListener('click', () => {
                const selector = container.querySelector('.id-selector');
                const selectedId = selector.value;
                const pageTemplate = button.dataset.pageTemplate;

                if (selectedId && pageTemplate) {
                    window.location.href = pageTemplate + selectedId;
                } else if (!selectedId) {
                    alert('Veuillez sélectionner un élément dans la liste.');
                }
            });
        });
    };

    // Setup each dynamic link container
    containers.forEach(setupContainer);
});
