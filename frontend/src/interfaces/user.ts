import type { Profile } from './profile';

export interface Role {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface User {
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
