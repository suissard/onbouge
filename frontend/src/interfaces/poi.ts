import type { Sport } from './sport';
import type { Event } from './event';

export interface Position {
  lat: number;
  lon: number;
}

export interface Poi {
  documentId: string;
  title: string;
  lattitude: number;
  longitude: number;
  description: string;
  gmaps_url: string;
  position: Position;
  sports: Sport[];
  events: Event[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
