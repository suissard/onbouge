const { getAuthenticatedApi, readData, publishEntry, delay, logProgress } = require('../utils');

async function main() {
  try {
    const api = await getAuthenticatedApi();
    const pois = readData('pois.json');
    const output = {};

    let count = 0;
    const total = pois.length;

    // Read ID maps from stdin (passed by orchestrator)
    let idMap = { activities: {}, pois: {}, profiles: {}, users: {} };
    if (process.env.ID_MAP) {
        try {
            idMap = JSON.parse(process.env.ID_MAP);
        } catch(e) {}
    }
    const profileIds = Object.values(idMap.profiles || {});
    let defaultAuthor = profileIds.length > 0 ? profileIds[0] : null;

    if (!defaultAuthor) {
        try {
             const profiles = await api.get('/api::profile.profile');
             if (profiles.data && profiles.data.length > 0) {
                 const p = profiles.data.results ? profiles.data.results[0] : (profiles.data[0] || profiles.data);
                 defaultAuthor = p.documentId || p.id;
             }
        } catch (e) {
            // console.warn('Could not fetch default author');
        }
    }

    for (const item of pois) {
      count++;
      logProgress(count, total, `Seeding ${item.title}`);
      const lat = item.latitude || (48.8 + Math.random() * 0.1);
      const lng = item.longitude || (2.3 + Math.random() * 0.1);

      try {
        const existing = await api.get(`/api::poi.poi?filters[title][$eq]=${encodeURIComponent(item.title)}`);
        let poiId;
        
        // Map relations
        const activityIds = item.activities?.map(a => idMap.activities[a.id]).filter(id => id) || [];

        if (existing.data.results && existing.data.results.length > 0) {
          const entry = existing.data.results[0];
          poiId = entry.documentId || entry.id;
          const updateId = entry.documentId || entry.id;
          await api.put(`/api::poi.poi/${updateId}`, {
              title: item.title,
              description: item.description,
              latitude: lat,
              longitude: lng,
              activities: activityIds,
              author: defaultAuthor
          });
        } else {
          const res = await api.post('/api::poi.poi', { 
              title: item.title,
              description: item.description,
              latitude: lat,
              longitude: lng,
              activities: activityIds,
              author: defaultAuthor
          });
          const entry = res.data.data || res.data;
          poiId = entry.documentId || entry.id;
        }
        await publishEntry(api, 'api::poi.poi', poiId);
        output[item.id] = poiId;
        await delay(); // Rate limiting
      } catch (e) {
        // console.error(`Failed to seed POI ${item.title}:`, e.message);
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
