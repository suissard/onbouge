import strapiReal from './strapi.real';
import strapiMock from './strapi.mock';

const getStrapiImplementation = () => {
  const useMock = localStorage.getItem('useStrapiMock') === 'true';
  if (useMock) {
    return strapiMock;
  } else {
    return strapiReal;
  }
};

const strapi = getStrapiImplementation();
export default strapi;
