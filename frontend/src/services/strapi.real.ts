import { strapi as createStrapiClient } from '@strapi/client';
import type { StrapiClient } from '@strapi/client';

// Base URL for the Strapi API
const BASE_URL = 'http://192.168.0.2:1337/api';

// Initial token
let token: string | null = "1b7c2a8ccfd2fedb775cab470bc724695338d7f00b9d14f8b9d9ffd7e6a6e5367228f29cc0663e0a59c0dcd139bd814c8d6e5766e874fd85e585a73ec2063d03987165bd58e9d2c7e430e8f81ce66ae5728a1d8f12af648550008bc63d0240d0150b3d29c599cb3044ed30c85d4012686b23c60e6cbbede73bb6d4fad4615216";

// Create the client instance
let strapiClient: StrapiClient = createStrapiClient({
  baseURL: BASE_URL,
  ...(token ? { auth: token } : {}),
});

// Wrapper object to export
const strapiService = {
  find(collection: string, queryParams?: any) {
    return strapiClient.collection(collection).find(queryParams);
  },

  findOne(collection: string, id: string | number, queryParams?: any) {
    return strapiClient.collection(collection).findOne(String(id), queryParams);
  },

  create(collection: string, data: any, queryParams?: any) {
    return strapiClient.collection(collection).create(data, queryParams);
  },

  update(collection: string, id: string | number, data: any, queryParams?: any) {
    return strapiClient.collection(collection).update(String(id), data, queryParams);
  },

  async login(credentials: any) {
    const response = await strapiClient.fetch('/auth/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (data.jwt) {
      this.setToken(data.jwt);
    }
    return data;
  },

  async register(userInfo: any) {
    const response = await strapiClient.fetch('/auth/local/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo),
    });
    const data = await response.json();
    if (data.jwt) {
        this.setToken(data.jwt);
    }
    return data;
  },

  setToken(newToken: string) {
    token = newToken;
    strapiClient = createStrapiClient({
      baseURL: BASE_URL,
      auth: token,
    });
  },

  signOut() {
    token = null;
    strapiClient = createStrapiClient({
        baseURL: BASE_URL,
    });
  },

  get rawClient() {
    return strapiClient;
  }
};

export default strapiService;
