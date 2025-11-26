import 'reflect-metadata';
import type { FieldDefinition } from '@/types/form';

const METADATA_KEY = 'form:fields';

export interface FormFieldOptions {
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'email';
  options?: { label: string; value: any }[];
  required?: boolean;
  // For dynamic data sources
  optionsKey?: string; // Key to lookup in dataSources prop
  itemTitle?: string; // Property to display (default: title/name)
  itemValue?: string; // Property to save (default: id)
  multiple?: boolean; // For multi-select
}

export function FormField(options: FormFieldOptions) {
  return function (target: any, propertyKey: string) {
    const fields: FieldDefinition[] = Reflect.getMetadata(METADATA_KEY, target) || [];
    
    fields.push({
      key: propertyKey,
      ...options,
    });

    Reflect.defineMetadata(METADATA_KEY, fields, target);
  };
}

export function getFormFields(target: any): FieldDefinition[] {
  // If target is a class constructor, use its prototype
  const prototype = typeof target === 'function' ? target.prototype : target;
  return Reflect.getMetadata(METADATA_KEY, prototype) || [];
}
