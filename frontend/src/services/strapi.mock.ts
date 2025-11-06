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

const  listMock = async function (contentType: string,): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[contentType].data || [] });
      }, 500);
    });
  }
  const getMock = async function(contentType: string, id: string): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[contentType].data?.find(item => item.id === id)|| [] });
      }, 500);
    });
  }

const strapi = {collections:{
  events:{list:()=> listMock("events"),get:(id:string)=> getMock("events",id)},
  pois:{list:()=> listMock("pois"),get:(id:string)=> getMock("pois",id)},
  users:{list:()=> listMock("users"),get:(id:string)=> getMock("users",id)},
  sports:{list:()=> listMock("sports"),get:(id:string)=> getMock("sports",id)}
  
}};

export default strapi;
