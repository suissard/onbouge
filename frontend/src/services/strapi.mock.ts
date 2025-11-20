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
  async get(url: string, queryParams?: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url === 'users/me') {
           resolve(users.data[0]);
        } else {
           resolve({});
        }
      }, 50);
    });
  },

  async find(collection: string, queryParams?: any): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[collection]?.data || [] });
      }, 50);
    });
  },

  async findOne(collection: string, id: string | number, queryParams?: any): Promise<{ data: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (collection === 'users' && id === 'me') {
          resolve({ data: users.data[0] });
        } else {
          const result = mockData[collection]?.data?.find((item: any) => item.documentId === id);
          resolve({ data: result || null });
        }
      }, 50);
    });
  },

  async create(collection: string, data: any, queryParams?: any): Promise<{ data: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem = { ...data, documentId: `mock-id-${Math.random()}` };
        mockData[collection].data.push(newItem);
        resolve({ data: newItem });
      }, 50);
    });
  },

  async update(collection: string, id: string | number, data: any, queryParams?: any): Promise<{ data: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockData[collection].data.findIndex((item: any) => item.documentId === id);
        if (index !== -1) {
          mockData[collection].data[index] = { ...mockData[collection].data[index], ...data };
          resolve({ data: mockData[collection].data[index] });
        } else {
          resolve({ data: null });
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
