import { FormField } from '@/decorators/form';
import type { Sport } from './sport';
import type { Event } from './event';
import type { User } from './user';

export class Profile {
  documentId: string = '';

  @FormField({ label: 'Nom d\'utilisateur', type: 'text' })
  username: string = '';

  @FormField({ label: 'Description', type: 'textarea' })
  description: string | null = '';

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
    label: 'Events',
    type: 'select',
    optionsKey: 'events',
    multiple: true,
    itemTitle: 'title',
    itemValue: 'documentId'
  })
  events: Event[] = [];

  user: User | null = null;
  createdAt: string = '';
  updatedAt: string = '';
  publishedAt: string | null = null;
}
