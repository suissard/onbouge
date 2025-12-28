const { getAuthenticatedApi, readData, publishEntry, delay, logProgress } = require('../utils');

async function main() {
  try {
    // Read ID maps from stdin (passed by orchestrator)
    let idMap = { activities: {}, pois: {}, profiles: {} };
    if (process.env.ID_MAP) {
        try {
            idMap = JSON.parse(process.env.ID_MAP);
        } catch(e) {}
    }

    const api = await getAuthenticatedApi();
    const events = readData('events.json');

    let count = 0;
    const total = events.length;

    for (const item of events) {
      count++;
      logProgress(count, total, `Seeding ${item.title}`);
      try {
        const existing = await api.get(`/api::event.event?filters[title][$eq]=${encodeURIComponent(item.title)}`);
        let eventId;
        let eventDocId;
        if (existing.data.results && existing.data.results.length > 0) {
          const entry = existing.data.results[0];
          eventId = entry.documentId || entry.id;
          eventDocId = entry.documentId || entry.id;
        }

        // Map relations
        const activityIds = item.activities?.map(a => idMap.activities[a.id]).filter(id => id) || [];
        const poiId = item.poi ? idMap.pois[item.poi.id] : null;
        const profileIds = item.profiles?.map(p => idMap.profiles[p.id]).filter(id => id) || [];
        
        const allProfileIds = Object.values(idMap.profiles || {});
        let defaultAuthor = allProfileIds.length > 0 ? allProfileIds[0] : null;

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

        // console.log(`Seeding Event ${item.title} with author ${defaultAuthor}`);

        const payload = {
          title: item.title,
          description: item.description,
          date: item.date,
          activities: { connect: activityIds },
          poi: poiId ? { connect: [poiId] } : null,
          profiles: { connect: profileIds },
          author: defaultAuthor ? { connect: [defaultAuthor] } : null
        };

        if (eventId) {
          await api.put(`/api::event.event/${eventDocId}`, payload);
        } else {
          const res = await api.post('/api::event.event', payload);
          const entry = res.data.data || res.data;
          eventDocId = entry.documentId || entry.id;
        }
        
        if (eventDocId) {
          await publishEntry(api, 'api::event.event', eventDocId);
        }
        await delay(); // Rate limiting
      } catch (e) {
        // console.error(`Failed to seed Event ${item.title}:`, e.message);
      }
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
