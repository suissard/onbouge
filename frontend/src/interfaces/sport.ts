import type { Poi } from './poi';
import type { Event } from './event';

export interface Sport {
  documentId: string;
  title: string;
  description: string;
  pois: Poi[];
  events: Event[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
