import events from '@/data/events.json';
import pois from '@/data/pois.json';
import users from '@/data/users.json';

const mockData: { [key: string]: any } = {
  events,
  pois,
  users,
};

const strapi = {
  async find(contentType: string, params?: any): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[contentType].data || [] });
      }, 500);
    });
  }
};

export default strapi;
