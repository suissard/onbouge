import { FormField } from '@/decorators/form';
import type { Sport } from './sport';
import type { Poi } from './poi';
import type { Profile } from './profile';

export class Event {
  documentId: string = '';

  @FormField({ label: 'Titre', type: 'text' })
  title: string = '';

  @FormField({ label: 'Description', type: 'textarea' })
  description: string = '';

  @FormField({ label: 'Date', type: 'date' })
  date: string = '';

  @FormField({ label: 'Image URL', type: 'text' })
  image?: string = '';

  @FormField({
    label: 'Sports',
    type: 'select',
    optionsKey: 'sports',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId'
  })
  sports: Sport[] = [];

  @FormField({
    label: 'POI',
    type: 'select',
    optionsKey: 'pois',
    itemTitle: 'title',
    itemValue: 'documentId'
  })
  poi: Poi | null = null;

  @FormField({
    label: 'Participants',
    type: 'select',
    optionsKey: 'profiles',
    multiple: true,
    itemTitle: 'username',
    itemValue: 'documentId'
  })
  profiles: Profile[] = [];
  
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
