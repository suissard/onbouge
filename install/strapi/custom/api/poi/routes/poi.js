'use strict';

/**
 * poi router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::poi.poi', {
  config: {
    update: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::poi.poi' } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::poi.poi' } },
      ],
    },
  },
});
