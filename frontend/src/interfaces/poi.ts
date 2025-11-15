import type { StrapiObject } from 'suissard-strapi-client';
import type { Sport } from './sport';
import type { Event } from './event';

export interface Position {
  lat: number;
  lon: number;
}

export interface Poi extends StrapiObject {
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
