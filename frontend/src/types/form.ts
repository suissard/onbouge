export interface FieldDefinition {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'email' | 'datetime';
    options?: { label: string; value: any }[]; // For select inputs
    required?: boolean;
    optionsKey?: string;
    itemTitle?: string;
    itemValue?: string;
    multiple?: boolean;
    remote?: boolean;
    storeKey?: string;
}
