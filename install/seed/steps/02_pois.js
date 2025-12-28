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
    
    let availableAuthorIds = Object.values(idMap.profiles || {});

    // If no profiles in map, try to fetch from API
    if (availableAuthorIds.length === 0) {
        try {
             // Try Content Manager API first
             console.log('Fetching profiles from API for authors...');
             const profiles = await api.get('/api::profile.profile');
             const results = profiles.data.results || profiles.data.data || (Array.isArray(profiles.data) ? profiles.data : []);
             availableAuthorIds = results.map(p => p.documentId || p.id);
             
             if (availableAuthorIds.length > 0) {
                 console.log(`Found ${availableAuthorIds.length} profiles to use as authors.`);
             } else {
                 console.warn('No profiles found to use as authors. POIs will be created without author.');
             }
        } catch (e) {
             console.error('Could not fetch profiles for authors:', e.message);
        }
    }

    for (const item of pois) {
      count++;
      logProgress(count, total, `Seeding ${item.title}`);
      const lat = item.latitude || (48.8 + Math.random() * 0.1);
      const lng = item.longitude || (2.3 + Math.random() * 0.1);

      // Pick random author
      const randomAuthor = availableAuthorIds.length > 0
        ? availableAuthorIds[Math.floor(Math.random() * availableAuthorIds.length)]
        : null;

      try {
        const existing = await api.get(`/api::poi.poi?filters[title][$eq]=${encodeURIComponent(item.title)}`);
        let poiId;
        
        // Map relations
        const activityIds = item.activities?.map(a => idMap.activities[a.id]).filter(id => id) || [];

        const poiData = {
              title: item.title,
              description: item.description,
              latitude: lat,
              longitude: lng,
              activities: { connect: activityIds },
              author: randomAuthor // Try direct ID
        };

        if (existing.data.results && existing.data.results.length > 0) {
          const entry = existing.data.results[0];
          poiId = entry.documentId || entry.id;
          const updateId = entry.documentId || entry.id;
          
          await api.put(`/api::poi.poi/${updateId}`, poiData);
        } else {
          // console.error(`Creating POI ${item.title} with author ${randomAuthor}`);
          const res = await api.post('/api::poi.poi', poiData);
          const entry = res.data.data || res.data;
          poiId = entry.documentId || entry.id;
        }

        // Verify
        try {
            const verification = await api.get(`/api::poi.poi/${poiId}?populate=author`);
            const vData = verification.data.data || verification.data;
            if (!vData.author) {
                 console.error(`Verification FAILED: POI ${item.title} has no author!`);
            } else {
                 console.log(`Verification OK: POI ${item.title} has author: ${JSON.stringify(vData.author)}`);
            }
        } catch(e) { console.error('Verify error', e.message); }
        
        await publishEntry(api, 'api::poi.poi', existing.data.results?.[0]?.documentId || poiId);
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
