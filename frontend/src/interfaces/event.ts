import { StrapiObject } from 'suissard-strapi-client';
import type { Sport } from './sport';
import type { Poi } from './poi';
import type { Profile } from './profile';

export interface Event extends StrapiObject {
  title: string;
  description: string;
  date: string;
  sports: Sport[];
  poi: Poi;
  profiles: Profile[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
