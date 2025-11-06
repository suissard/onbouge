import events from '@/data/events.json';
import pois from '@/data/pois.json';
import users from '@/data/users.json';
import sports from '@/data/sports.json';

const mockData: { [key: string]: any } = {
  events,
  pois,
  users,
  sports,
};

const strapi = {
  async list(contentType: string, params?: any): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[contentType].data || [] });
      }, 500);
    });
  },  async get(contentType: string, id: string,params?: any): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[contentType].data?.find(item => item.id === id)|| [] });
      }, 500);
    });
  }
};

export default strapi;
