import strapiReal from './strapi.real';
import strapiMock from './strapi.mock';

const getStrapiImplementation = () => {
  const useMock = localStorage.getItem('useStrapiMock') === 'true';
  if (useMock) {
    console.log("Using fake data (mock)");
    return strapiMock;
  } else {
    console.log("Using real data");
    return strapiReal;
  }
};

const strapiProxy = new Proxy({}, {
  get: function(target, prop, receiver) {
    const strapi = getStrapiImplementation();
    return Reflect.get(strapi, prop, receiver);
  },
  set: function(target, prop, value, receiver) {
    const strapi = getStrapiImplementation();
    return Reflect.set(strapi, prop, value, receiver);
  }
});

export default strapiProxy;
