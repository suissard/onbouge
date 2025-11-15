import events from '@/data/events.json';
import pois from '@/data/pois.json';
import users from '@/data/users.json';
import profiles from '@/data/profiles.json';
import sports from '@/data/sports.json';

const mockData: { [key: string]: any } = {
  events,
  pois,
  users,
  profiles,
  sports
};

interface CollectionMethods {
  list: () => Promise<{ data: any[] }>;
  get: (id: string) => Promise<{ data: any }>;
  create: (data: any) => Promise<{ data: any }>;
  update: (id: string, data: any) => Promise<{ data: any }>;
  delete: (id: string) => Promise<{ data: {} }>;
}

interface StrapiMock {
  collections: {
    [key: string]: CollectionMethods;
  };
  login: (credentials: any) => Promise<{ jwt: string; user: any }>;
  register: (userInfo: any) => Promise<{ jwt: string; user: any }>;
  setToken: (token: string) => void;
  signOut: () => void;
  get: (...args: any[]) => any;
}

const listMock = async function (contentType: string): Promise<{ data: any[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockData[contentType].data || [] });
    }, 500);
  });
}

const getMock = async function(contentType: string, id: string): Promise<{ data: any }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockData[contentType].data?.find((item: any) => item.documentId === id) || null });
    }, 500);
  });
}

const createCollectionMethods = (collectionName: string): CollectionMethods => ({
  list: () => listMock(collectionName),
  get: (id: string) => getMock(collectionName, id),
  create: (data: any) => Promise.resolve({ data }),
  update: (id: string, data: any) => Promise.resolve({ data }),
  delete: (id: string) => Promise.resolve({ data: {} }),
});

const strapi: StrapiMock = {
  collections: {
    events: createCollectionMethods('events'),
    pois: createCollectionMethods('pois'),
    users: createCollectionMethods('users'),
    profiles: createCollectionMethods('profiles'),
    sports: createCollectionMethods('sports'),
  },
  login: async (credentials: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jwt: 'mock-token',
          user: mockData.users.data[0],
        });
      }, 500);
    });
  },
  register: async (userInfo: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jwt: 'mock-token',
          user: mockData.users.data[0],
        });
      }, 500);
    });
  },
  setToken(token: string) {},
  signOut() {},
  get() {
    let target:string = arguments[0].split("?")[0], id:string = ""
    if (target.includes("/")){
      id = target.split("/")[1]
      if(id=="me") return Promise.resolve(mockData.users.data[0])
      target = target.split("/")[0]
      return strapi.collections[target].get(id)
    }

    if (strapi.collections[target]){
      return Promise.resolve({data:mockData[target]})
    }
  }
};

export default strapi;
