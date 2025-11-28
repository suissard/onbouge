module.exports = {
  async afterCreate(event) {
    const { result } = event;
    if (result.latitude && result.longitude) {
      // Use setTimeout to avoid transaction deadlock with the main request
      setTimeout(async () => {
        try {
          await strapi.db.connection.raw(
            `UPDATE pois SET location = ST_GeomFromText('POINT(${result.longitude} ${result.latitude})') WHERE id = ?`,
            [result.id]
          );
        } catch (err) {
          strapi.log.error('Error updating POI location:', err);
        }
      }, 100);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    if (result.latitude && result.longitude) {
      // Use setTimeout to avoid transaction deadlock with the main request
      setTimeout(async () => {
        try {
          await strapi.db.connection.raw(
            `UPDATE pois SET location = ST_GeomFromText('POINT(${result.longitude} ${result.latitude})') WHERE id = ?`,
            [result.id]
          );
        } catch (err) {
          strapi.log.error('Error updating POI location:', err);
        }
      }, 100);
    }
  },
};
