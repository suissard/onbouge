import StrapiClient from 'suissard-strapi-client';

// The default Strapi URL. This can be overridden by an environment variable.
const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

const strapi = new StrapiClient({
  url: strapiUrl,
  prefix: '/api'
});

export default strapi;
