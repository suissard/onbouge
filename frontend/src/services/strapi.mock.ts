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

const  listMock = async function (contentType: string,): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[contentType].data || [] });
      }, 500);
    });
  }
  const getMock = async function(contentType: string, id: string): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      console.log(id, mockData[contentType].data, mockData[contentType].data?.find(item => item.id === id))

      setTimeout(() => {
        resolve({ data: mockData[contentType].data?.find(item => item.id === id)|| [] });
      }, 500);
    });
  }

const strapi = {collections:{
  events:{list:()=> listMock("events"),get:(id:string)=> getMock("events",id)},
  pois:{list:()=> listMock("pois"),get:(id:string)=> getMock("pois",id)},
  users:{list:()=> listMock("users"),get:(id:string)=> getMock("users",id)},
  profiles:{list:()=> listMock("profiles"),get:(id:string)=> getMock("profiles",id)},
  sports:{list:()=> listMock("sports"),get:(id:string)=> getMock("sports",id)}
  
}};

export default strapi;
