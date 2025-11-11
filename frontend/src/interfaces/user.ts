import { StrapiObject } from 'suissard-strapi-client';
import type { Profile } from './profile';

export interface Role extends StrapiObject {
  name: string;
  description: string;
  type: string;
}

export interface User extends StrapiObject {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role: Role;
  profile: Profile;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
