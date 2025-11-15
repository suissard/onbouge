declare module 'suissard-strapi-client' {
  export interface StrapiObject {
    id: number;
    documentId: string;
  }

  export default class Strapi {
    constructor(options: { baseURL: string; collections: string[]; token: string });
    get(path: string): Promise<{ data: any }>;
    setToken(token: string): void;
    login(credentials: any): Promise<any>;
    signOut(): void;
    register(userInfo: any): Promise<any>;
  }
}
