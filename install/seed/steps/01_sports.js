const { getAuthenticatedApi, readData, publishEntry, delay } = require('../utils');

async function main() {
  try {
    const api = await getAuthenticatedApi();
    const sports = readData('sports.json');
    
    // We output JSON for the orchestrator to consume
    const output = {};

    for (const item of sports) {
      try {
        const existing = await api.get(`/api::sport.sport?filters[title][$eq]=${encodeURIComponent(item.title)}`);
        let sportId;
        if (existing.data.results && existing.data.results.length > 0) {
          const entry = existing.data.results[0];
          sportId = entry.documentId || entry.id;
          const updateId = entry.documentId || entry.id;
          await api.put(`/api::sport.sport/${updateId}`, {
              title: item.title
          });
        } else {
          const res = await api.post('/api::sport.sport', { 
              title: item.title
          });
          const entry = res.data.data || res.data;
          sportId = entry.documentId || entry.id;
        }
        await publishEntry(api, 'api::sport.sport', sportId);
        output[item.id] = sportId;
        await delay(); // Rate limiting
      } catch (e) {
        // console.error(`Failed to seed sport ${item.title}:`, e.message);
      }
    }
    
    console.log(JSON.stringify(output));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
