import strapiReal from './strapi.real';
import strapiMock from './strapi.mock';

// Define a type that represents the Strapi service interface
export type StrapiService = typeof strapiReal;

const getStrapiImplementation = (): StrapiService => {
  const useMock = localStorage.getItem('useStrapiMock') === 'true';
  if (useMock) {
    // The mock needs to be cast because its type is inferred and doesn't explicitly match the real service
    return strapiMock as unknown as StrapiService;
  } else {
    return strapiReal;
  }
};

const strapi: StrapiService = getStrapiImplementation();
export default strapi;
