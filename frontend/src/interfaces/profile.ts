import type { StrapiObject } from 'suissard-strapi-client';
import type { Sport } from './sport';
import type { Event } from './event';
import type { User } from './user';

export interface Profile extends StrapiObject {
  username: string;
  description: string | null;
  sports: Sport[];
  events: Event[];
  user: User;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
