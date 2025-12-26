import { FormField } from '@/decorators/form';
import type { Activity } from './activity';
import type { Poi } from './poi';
import type { Profile } from './profile';

export class Event {
  documentId: string = '';

  @FormField({ label: 'Titre', type: 'text', required: true })
  title: string = '';

  @FormField({ label: 'Description', type: 'textarea', required: true })
  description: string = '';

  @FormField({ label: 'Date', type: 'datetime', required: true })
  date: string = '';

  @FormField({ label: 'Image URL', type: 'text' })
  image?: string = '';

  @FormField({
    label: 'Activities',
    type: 'select',
    optionsKey: 'activities',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId',
    remote: true,
    storeKey: 'activities'
  })
  activities: Activity[] = [];

  @FormField({
    label: 'POI',
    type: 'select',
    optionsKey: 'pois',
    itemTitle: 'title',
    itemValue: 'documentId',
    remote: true,
    storeKey: 'pois'
  })
  poi: Poi | null = null;

  @FormField({
    label: 'Participants',
    type: 'select',
    optionsKey: 'profiles',
    multiple: true,
    itemTitle: 'username',
    itemValue: 'documentId',
    remote: true,
    storeKey: 'profiles'
  })
  profiles: Profile[] = [];
  
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
