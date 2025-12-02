const { getAuthenticatedApi, readData, publishEntry, delay, logProgress } = require('../utils');

async function main() {
  try {
    const api = await getAuthenticatedApi();
    const activities = readData('activities.json');
    
    // We output JSON for the orchestrator to consume
    const output = {};

    let count = 0;
    const total = activities.length;

    // Read ID maps from stdin (passed by orchestrator)
    let idMap = { activities: {}, pois: {}, profiles: {}, users: {} };
    if (process.env.ID_MAP) {
        try {
            idMap = JSON.parse(process.env.ID_MAP);
        } catch(e) {}
    }
    const userIds = Object.values(idMap.users || {});
    let defaultAuthor = userIds.length > 0 ? userIds[0] : null;

    if (!defaultAuthor) {
        try {
             const users = await api.get('/users?filters[email][$eq]=admin@gmail.com');
             if (users.data && users.data.length > 0) {
                 defaultAuthor = users.data[0].id;
             }
        } catch (e) {
            // console.warn('Could not fetch default author');
        }
    }

    for (const item of activities) {
      count++;
      logProgress(count, total, `Seeding ${item.title}`);
      try {
        const existing = await api.get(`/api::activity.activity?filters[title][$eq]=${encodeURIComponent(item.title)}`);
        let activityId;
        if (existing.data.results && existing.data.results.length > 0) {
          const entry = existing.data.results[0];
          activityId = entry.documentId || entry.id;
          const updateId = entry.documentId || entry.id;
          await api.put(`/api::activity.activity/${updateId}`, {
              title: item.title,
              author: defaultAuthor
          });
        } else {
          const res = await api.post('/api::activity.activity', { 
              title: item.title,
              author: defaultAuthor
          });
          const entry = res.data.data || res.data;
          activityId = entry.documentId || entry.id;
        }
        await publishEntry(api, 'api::activity.activity', activityId);
        output[item.id] = activityId;
        await delay(); // Rate limiting
      } catch (e) {
        // console.error(`Failed to seed activity ${item.title}:`, e.message);
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
