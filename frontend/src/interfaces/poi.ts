import { FormField } from '@/decorators/form';
import type { Activity } from './activity';
import type { Event } from './event';

export interface Position {
  lat: number;
  lon: number;
}

export class Poi {
  documentId: string = '';

  @FormField({ label: 'Titre', type: 'text' })
  title: string = '';

  @FormField({ label: 'Latitude', type: 'number' })
  latitude: number = 0;

  @FormField({ label: 'Longitude', type: 'number' })
  longitude: number = 0;

  @FormField({ label: 'Description', type: 'textarea' })
  description: string = '';

  @FormField({ label: 'Lien Google Maps', type: 'text' })
  gmaps_url: string = '';

  position: Position = { lat: 0, lon: 0 };
  @FormField({
    label: 'Activities',
    type: 'select',
    optionsKey: 'activities',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId'
  })
  activities: Activity[] = [];

  @FormField({
    label: 'Events',
    type: 'select',
    optionsKey: 'events',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId'
  })
  events: Event[] = [];
  
  @FormField({
    label: 'Auteur',
    type: 'select',
    optionsKey: 'users',
    itemTitle: 'username',
    itemValue: 'documentId'
  })
  author: any = null; // Using any to avoid circular dependency issues for now, or import User

  createdAt: string = '';
  updatedAt: string = '';
  publishedAt: string = '';
}
