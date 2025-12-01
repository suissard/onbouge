'use strict';

/**
 * event router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::event.event', {
  config: {
    update: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::event.event' } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::event.event' } },
      ],
    },
  },
});
