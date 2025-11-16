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
  sports,
};

const strapiMock = {
  collection: (collectionName: string) => {
    return {
      find: async (queryParams?: any) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: mockData[collectionName] });
          }, 50);
        });
      },
      findOne: async (documentId: string, queryParams?: any) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (collectionName === 'users' && documentId === 'me') {
              resolve({ data: users.data[0] });
            } else {
              const result = mockData[collectionName]?.data?.find((item: any) => item.documentId === documentId);
              resolve({ data: result || null });
            }
          }, 50);
        });
      },
      create: async (data: any, queryParams?: any) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: { ...data, id: Math.random().toString() } });
          }, 50);
        });
      },
      update: async (documentId: string, data: any, queryParams?: any) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: { ...data, id: documentId } });
          }, 50);
        });
      },
      delete: async (documentId: string, queryParams?: any) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: { id: documentId } });
          }, 50);
        });
      },
    };
  },
  // Mock other methods as needed, like login, register, etc.
};

export default strapiMock;
