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

const strapi = {
  collections:{
    events:{list:()=> listMock("events"),get:(id:string)=> getMock("events",id)},
    pois:{list:()=> listMock("pois"),get:(id:string)=> getMock("pois",id)},
    users:{list:()=> listMock("users"),get:(id:string)=> getMock("users",id)},
    profiles:{list:()=> listMock("profiles"),get:(id:string)=> getMock("profiles",id)},
    sports:{list:()=> listMock("sports"),get:(id:string)=> getMock("sports",id)}
  },
  login: async (credentials: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jwt: 'mock-token',
          user: this.collections.users[0],
        });
      }, 500);
    });
  },
  register: async (userInfo: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jwt: 'mock-token',
          user: this.collections.users[0],
        });
      }, 500);
    });
  },
  setToken(token: string){},
  signOut(){},
  get(){
    let target:string = arguments[0].split("?")[0]
    console.log("get",target)
    if (this.collections[target]){
      return this.collections[target].list()
    }
  }
};

export default strapi;
