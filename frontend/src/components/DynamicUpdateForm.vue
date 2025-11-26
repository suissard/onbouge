<template>
    <v-card class="dynamic-update-form pa-4">
        <v-card-title v-if="title" class="text-h5 mb-4">{{ title }}</v-card-title>
        <v-form @submit.prevent="save">
            <div v-for="field in activeFields" :key="field.key" class="mb-2">

                <!-- Text, Email, Password, Number Inputs -->
                <v-text-field v-if="['text', 'email', 'password', 'number'].includes(field.type)" :label="field.label"
                    :type="field.type" v-model="formData[field.key]" variant="outlined"
                    density="comfortable"></v-text-field>

                <!-- Date Input -->
                <v-text-field v-if="field.type === 'date'" :label="field.label" type="date"
                    v-model="formData[field.key]" variant="outlined" density="comfortable"></v-text-field>

                <!-- Textarea -->
                <v-textarea v-if="field.type === 'textarea'" :label="field.label" v-model="formData[field.key]"
                    variant="outlined" rows="3" auto-grow></v-textarea>

                <!-- Select -->
                <v-select v-if="field.type === 'select'" v-model="formData[field.key]" :label="field.label"
                    :items="field.optionsKey ? dataSources[field.optionsKey] : field.options"
                    :item-title="field.itemTitle || 'title'" :item-value="field.itemValue || 'documentId'"
                    :multiple="field.multiple" :chips="field.multiple" :clearable="!field.required" variant="outlined"
                    density="comfortable"></v-select>

                <!-- Checkbox -->
                <v-checkbox v-if="field.type === 'checkbox'" :label="field.label" v-model="formData[field.key]"
                    density="comfortable"></v-checkbox>
            </div>

            <!-- Custom Fields Slot -->
            <slot :form-data="formData"></slot>

            <v-card-actions class="justify-end mt-4">
                <v-btn variant="outlined" color="grey-darken-1" @click="cancel">
                    Annuler
                </v-btn>
                <v-btn type="submit" color="primary" variant="elevated">
                    Enregistrer
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed, type PropType } from 'vue';
import { getFormFields } from '@/decorators/form';

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

const props = defineProps({
    initialData: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    modelClass: {
        type: Function as unknown as PropType<new () => any>,
        required: true,
    },
    dataSources: {
        type: Object as PropType<Record<string, any[]>>,
        default: () => ({}),
    },
    title: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['save', 'cancel']);

// Determine fields to use: props.fields takes precedence, otherwise load from schema
const activeFields = computed(() => {
    if (props.modelClass) {
        return getFormFields(props.modelClass);
    }
    return [];
});

// Create a local copy of the data to edit
const formData = ref<Record<string, any>>({});

// Initialize formData from initialData
watch(
    () => props.initialData,
    (newData) => {
        formData.value = JSON.parse(JSON.stringify(newData));
    },
    { immediate: true, deep: true }
);

const save = () => {
    emit('save', formData.value);
};

const cancel = () => {
    // Reset form data to initial state
    formData.value = JSON.parse(JSON.stringify(props.initialData));
    emit('cancel');
};
</script>

<style scoped>
/* Vuetify handles most styling */
</style>
