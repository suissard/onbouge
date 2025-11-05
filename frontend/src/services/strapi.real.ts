import StrapiClient from 'suissard-strapi-client';

const strapi = new StrapiClient({
  baseUrl: 'http://localhost:1337',
});

export default strapi;
