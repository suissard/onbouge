import strapiReal from './strapi.real';
import strapiMock from './strapi.mock';

type StrapiClient = typeof strapiReal;

const getStrapiImplementation = (): StrapiClient => {
  const useMock = typeof window !== 'undefined' && localStorage.getItem('useStrapiMock') === 'true';
  if (useMock) {
    return strapiMock as StrapiClient;
  } else {
    return strapiReal;
  }
};

const strapi = getStrapiImplementation();

export default strapi;
