import { strapi as createStrapiClient } from '@strapi/client';
import type { StrapiClient } from '@strapi/client';

// Base URL for the Strapi API
const BASE_URL = 'http://192.168.0.2:1337/api';

// Initial token
let token: string | null = null;

// Create the client instance
let strapiClient: StrapiClient = createStrapiClient({
  baseURL: BASE_URL,
  ...(token ? { auth: token } : {}),
});

interface StrapiService {
  find(collection: string, queryParams?: any): Promise<any>;
  findOne(collection: string, id: string | number, queryParams?: any): Promise<any>;
  create(collection: string, data: any, queryParams?: any): Promise<any>;
  update(collection: string, id: string | number, data: any, queryParams?: any): Promise<any>;
  delete(collection: string, id: string | number, queryParams?: any): Promise<any>;
  login(credentials: any): Promise<any>;
  register(userInfo: any): Promise<any>;
  getMe(): Promise<any>;
  setToken(newToken: string): void;
  signOut(): void;
  readonly rawClient: StrapiClient;
}

// Wrapper object to export
const strapiService: StrapiService = {
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

  delete(collection: string, id: string | number, queryParams?: any) {
    return strapiClient.collection(collection).delete(String(id), queryParams);
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

  async getMe() {
    const response = await strapiClient.fetch('/users/me');
    return await response.json();
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
