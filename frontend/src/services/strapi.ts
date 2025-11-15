import strapiReal from './strapi.real';
import strapiMock from './strapi.mock';
import type Strapi from 'suissard-strapi-client';

const getStrapiImplementation = (): Strapi => {
  const useMock = localStorage.getItem('useStrapiMock') === 'true';
  if (useMock) {
    return strapiMock;
  } else {
    return strapiReal;
  }
};

const strapi: Strapi = getStrapiImplementation();
export default strapi;
