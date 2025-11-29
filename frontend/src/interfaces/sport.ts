import { FormField } from '@/decorators/form';
import type { Poi } from './poi';
import type { Event } from './event';

export class Sport {
  documentId: string = '';

  @FormField({ label: 'Title', type: 'text' })
  title: string = '';

  @FormField({ label: 'Description', type: 'textarea' })
  description: string = '';

  @FormField({
    label: 'POIs',
    type: 'select',
    optionsKey: 'pois',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId'
  })
  pois: Poi[] = [];

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
  author: any = null;

  createdAt: string = '';
  updatedAt: string = '';
  publishedAt: string = '';
}
