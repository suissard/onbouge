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

/**
 * Mocks fetching a list of items for a given content type.
 * @param {string} contentType - The name of the content type (e.g., "events").
 * @returns {Promise<{ data: any[] }>} A promise that resolves to the mock data.
 */
const  listMock = async function (contentType: string,): Promise<{ data: any[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData[contentType].data || [] });
      }, 500);
    });
  }

  /**
   * Mocks fetching a single item by ID for a given content type.
   * @param {string} contentType - The name of the content type (e.g., "events").
   * @param {string} id - The ID of the item to fetch.
   * @returns {Promise<{ data: any[] }>} A promise that resolves to the mock data.
   */
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
  /**
   * Mocks the login process.
   * @param {any} credentials - The user's credentials.
   * @returns {Promise<{ jwt: string, user: any }>} A promise that resolves to a mock token and user.
   */
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
  /**
   * Mocks the user registration process.
   * @param {any} userInfo - The user's registration information.
   * @returns {Promise<{ jwt: string, user: any }>} A promise that resolves to a mock token and user.
   */
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
  /**
   * Mock function for setting the authentication token.
   * @param {string} token - The authentication token.
   */
  setToken(token: string){},
  /**
   * Mock function for signing out.
   */
  signOut(){},
  /**
   * Mock function for making a GET request.
   * @returns {Promise<{ data: any[] }> | undefined} A promise that resolves to the mock data, or undefined if the content type is not found.
   */
  get(){
    let target:string = arguments[0].split("?")[0]
    console.log("get",target)
    if (this.collections[target]){
      return this.collections[target].list()
    }
  }
};

export default strapi;
