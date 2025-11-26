export interface FieldDefinition {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'email';
    options?: { label: string; value: any }[]; // For select inputs
    required?: boolean;
    optionsKey?: string;
    itemTitle?: string;
    itemValue?: string;
    multiple?: boolean;
}
