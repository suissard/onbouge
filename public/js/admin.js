document.addEventListener('DOMContentLoaded', () => {
    const importButton = document.getElementById('import-data');
    const strapiUrlInput = document.getElementById('strapi-url');
    const strapiPortInput = document.getElementById('strapi-port');
    const strapiTokenInput = document.getElementById('strapi-token');

    importButton.addEventListener('click', async () => {
        const strapiUrl = strapiUrlInput.value;
        const strapiPort = strapiPortInput.value;
        const strapiToken = strapiTokenInput.value;

        if (!strapiUrl || !strapiPort || !strapiToken) {
            alert('Please fill in all Strapi fields.');
            return;
        }

        const baseUrl = `http://${strapiUrl}:${strapiPort}/api`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${strapiToken}`
        };

        const collections = ['users', 'pois', 'events', 'sports', 'profiles'];

        for (const collection of collections) {
            try {
                const response = await fetch(`/data/${collection}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${collection}.json: ${response.statusText}`);
                }
                const data = await response.json();

                for (const item of data) {
                    const postResponse = await fetch(`${baseUrl}/${collection}`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ data: item })
                    });

                    if (!postResponse.ok) {
                        const errorData = await postResponse.json();
                        console.error(`Error importing ${collection}:`, errorData);
                        alert(`Error importing ${collection}: ${errorData.error.message}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing ${collection}.json:`, error);
                alert(`Error processing ${collection}.json: ${error.message}`);
            }
        }
        alert('Data import completed!');
    });
});
