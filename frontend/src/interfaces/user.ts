import { FormField } from '@/decorators/form';
import type { Profile } from './profile';

export interface Role {
  documentId: string;
  name: string;
  description: string;
  type: string;
}

export class User {
  documentId: string = '';
  id: number = 0;

  @FormField({ label: 'Nom d\'utilisateur', type: 'text' })
  username: string = '';

  @FormField({ label: 'Email', type: 'email' })
  email: string = '';

  provider: string = '';

  @FormField({ label: 'Confirmé', type: 'checkbox' })
  confirmed: boolean = false;

  @FormField({ label: 'Bloqué', type: 'checkbox' })
  blocked: boolean = false;

  @FormField({
    label: 'Role',
    type: 'select',
    optionsKey: 'roles',
    itemTitle: 'name',
    itemValue: 'id'
  })
  role: Role | null = null;

  @FormField({
    label: 'Profile',
    type: 'select',
    optionsKey: 'profiles',
    itemTitle: 'username',
    itemValue: 'documentId'
  })
  profile: Profile | null = null;
  createdAt: string = '';
  updatedAt: string = '';
  publishedAt: string = '';
}
