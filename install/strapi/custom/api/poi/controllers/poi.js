'use strict';

/**
 * poi controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::poi.poi', ({ strapi }) => ({
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
