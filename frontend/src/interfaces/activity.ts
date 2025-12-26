
import { FormField } from '@/decorators/form';
import type { Poi } from './poi';
import type { Event } from './event';

export class Activity {
  documentId: string = '';

  @FormField({ label: 'Title', type: 'text', required: true })
  title: string = '';

  @FormField({ label: 'Description', type: 'textarea', required: true })
  description: string = '';

  @FormField({
    label: 'POIs',
    type: 'select',
    optionsKey: 'pois',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId',
    remote: true,
    storeKey: 'pois'
  })
  pois: Poi[] = [];

  @FormField({
    label: 'Events',
    type: 'select',
    optionsKey: 'events',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId',
    remote: true,
    storeKey: 'events'
  })
  events: Event[] = [];

  @FormField({
    label: 'Auteur',
    type: 'select',
    optionsKey: 'users',
    itemTitle: 'username',
    itemValue: 'documentId',
    remote: true,
    storeKey: 'profiles'
  })
  author: any = null;

  createdAt: string = '';
  updatedAt: string = '';
  publishedAt: string = '';
}
