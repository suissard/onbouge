'use strict';

/**
 * poi controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::poi.poi', ({ strapi }) => ({
  async find(ctx) {
      // Calling the default core action
      const { data, meta } = await super.find(ctx);

      // WORKAROUND: Manually fetch author if missing
      // This helps if the default query building or sanitization is stripping it
      try {
          if (data && data.length > 0) {
              const authorsToFetch = data.map(p => p.documentId);
              const pois = await strapi.documents('api::poi.poi').findMany({
                  filters: {
                      documentId: {
                          $in: authorsToFetch
                      }
                  },
                  populate: ['author']
              });
              
              // Map back
              for (const p of data) {
                  const full = pois.find(x => x.documentId === p.documentId);
                  if (full && full.author) {
                      p.author = full.author;
                  }
              }
              // strapi.log.debug('Manually patched authors into POI response');
          }
      } catch (e) {
          strapi.log.error('Failed to patch authors', e);
      }

      return { data, meta };
  },

  async findNearby(ctx) {
    const { lat, lng, distance } = ctx.query;

    if (!lat || !lng || !distance) {
      return ctx.badRequest('Missing lat, lng, or distance parameters');
    }

    const distanceInMeters = parseFloat(distance) * 1000;

    try {
        const result = await strapi.db.connection.raw(`
            SELECT *, 
            ST_Distance_Sphere(location, ST_GeomFromText('POINT(${lng} ${lat})')) as distance 
            FROM pois 
            WHERE ST_Distance_Sphere(location, ST_GeomFromText('POINT(${lng} ${lat})')) <= ${distanceInMeters}
            AND published_at IS NOT NULL
            ORDER BY distance ASC
        `);

        // Handle different database return formats (array vs object with rows)
        const rows = result.rows ? result.rows : result[0];

        // Parse location if it's returned as a buffer or string (depending on driver)
        const sanitizedRows = rows.map(row => {
            if (row.location && typeof row.location === 'object') {
                // If it's a geometry object, we might want to simplify it or just keep lat/lng columns
                // For now, we rely on the latitude/longitude columns we added
            }
            return row;
        });

        return sanitizedRows;
    } catch (err) {
        strapi.log.error('Error in findNearby:', err);
        return ctx.internalServerError('Internal server error');
    }
  },
}));
