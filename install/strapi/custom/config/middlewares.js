module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::ratelimit',
    config: {
      max: env.int('STRAPI_RATELIMIT_MAX', 100000),
    },
  },
];
env.bool('PROD', false) ? 10 :