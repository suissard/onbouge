import events from '@/data/events.json';
import pois from '@/data/pois.json';
import users from '@/data/users.json';
import profiles from '@/data/profiles.json';
import sports from '@/data/sports.json';
import type Strapi from 'suissard-strapi-client';

const mockData: { [key: string]: any } = {
  events,
  pois,
  users,
  profiles,
  sports,
};

const strapiMock: Strapi = {
  async get(path: string): Promise<{ data: any }> {
    const [target] = path.split('?');
    const [collection, id] = target.split('/');

    return new Promise((resolve) => {
      setTimeout(() => {
        if (id) {
          if (collection === 'users' && id === 'me') {
            resolve({ data: users.data[0] });
          } else {
            const result = mockData[collection]?.data?.find((item: any) => item.documentId === id);
            resolve({ data: result || null });
          }
        } else {
          resolve({ data: mockData[collection] });
        }
      }, 50);
    });
  },
  async login(credentials: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jwt: 'mock-token',
          user: users.data[0],
        });
      }, 50);
    });
  },
  async register(userInfo: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jwt: 'mock-token',
          user: users.data[0],
        });
      }, 50);
    });
  },
  setToken(token: string): void {
    // Mock implementation, does nothing.
  },
  signOut(): void {
    // Mock implementation, does nothing.
  },
};

export default strapiMock;
