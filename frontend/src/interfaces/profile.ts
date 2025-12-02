import { FormField } from '@/decorators/form';
import type { Activity } from './activity';
import type { Event } from './event';
import type { User } from './user';

export class Profile {
  documentId: string = '';

  @FormField({ label: 'Nom d\'utilisateur', type: 'text' })
  username: string = '';

  @FormField({ label: 'Description', type: 'textarea' })
  description: string | null = '';

  photo: any = null;

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

  user: User | null = null;
  createdAt: string = '';
  updatedAt: string = '';
  publishedAt: string | null = null;
}
