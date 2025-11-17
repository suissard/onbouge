import type { Sport } from './sport';
import type { Poi } from './poi';
import type { Profile } from './profile';

export interface Event {
  documentId: string;
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
