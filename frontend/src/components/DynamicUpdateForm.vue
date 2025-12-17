<template>
    <v-card class="dynamic-update-form pa-4">
        <v-card-title v-if="title" class="text-h5 mb-4">{{ title }}</v-card-title>
        <v-form @submit.prevent="handleSubmit" v-model="formIsValid">
            <div v-for="field in activeFields" :key="field.key" class="mb-2">

                <!-- Text, Email, Password, Number Inputs -->
                <v-text-field v-if="['text', 'email', 'password', 'number'].includes(field.type)"
                    :label="field.required ? field.label + ' *' : field.label" :type="field.type"
                    v-model="formData[field.key]" variant="outlined"
                    :rules="field.required ? [v => !!v || 'Field is required'] : []"
                    density="comfortable"></v-text-field>

                <!-- Date Input -->
                <!-- Date Input -->
                <!-- Date Input -->
                <v-text-field v-if="field.type === 'date'" :label="field.required ? field.label + ' *' : field.label"
                    type="date" :rules="field.required ? [v => !!v || 'Field is required'] : []"
                    v-model="formData[field.key]" variant="outlined" density="comfortable"></v-text-field>
                <v-text-field v-if="field.type === 'datetime'"
                    :label="field.required ? field.label + ' *' : field.label" type="datetime-local"
                    :rules="field.required ? [v => !!v || 'Field is required'] : []" v-model="formData[field.key]"
                    variant="outlined" density="comfortable"></v-text-field>

                <!-- Textarea -->
                <v-textarea v-if="field.type === 'textarea'" :label="field.required ? field.label + ' *' : field.label"
                    v-model="formData[field.key]" :rules="field.required ? [v => !!v || 'Field is required'] : []"
                    variant="outlined" rows="3" auto-grow></v-textarea>

                <!-- Select -->
                <v-select v-if="field.type === 'select'" v-model="formData[field.key]"
                    :label="field.required ? field.label + ' *' : field.label"
                    :items="field.optionsKey ? dataSources[field.optionsKey] : field.options"
                    :item-title="field.itemTitle || 'title'" :item-value="field.itemValue || 'documentId'"
                    :multiple="field.multiple" :chips="field.multiple" :clearable="!field.required" variant="outlined"
                    :rules="field.required ? [v => (field.multiple ? v && v.length > 0 : !!v) || 'Field is required'] : []"
                    density="comfortable"></v-select>

                <!-- Checkbox -->
                <v-checkbox v-if="field.type === 'checkbox'" :label="field.required ? field.label + ' *' : field.label"
                    v-model="formData[field.key]" :rules="field.required ? [v => !!v || 'Field is required'] : []"
                    density="comfortable"></v-checkbox>
            </div>

            <!-- Custom Fields Slot -->
            <slot :form-data="formData"></slot>

            <v-card-actions class="justify-end mt-4">
                <v-btn color="primary" type="submit" class="mr-2" :disabled="!formIsValid">Save</v-btn>
                <v-btn color="error" variant="text" class="mr-2" @click="showDeleteConfirm = true"
                    v-if="canDelete">Delete</v-btn>
                <v-btn color="grey" variant="text" @click="cancel">Cancel</v-btn>
            </v-card-actions>
        </v-form>

        <v-dialog v-model="showDeleteConfirm" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">Are you sure?</v-card-title>
                <v-card-text>Do you really want to delete this item? This process cannot be undone.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="showDeleteConfirm = false">Cancel</v-btn>
                    <v-btn color="blue-darken-1" variant="text" @click="confirmDelete">OK</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed, type PropType } from 'vue';
import { getFormFields } from '@/decorators/form';
import type { FieldDefinition } from '@/types/form';
import { useAuthStore } from '@/stores/authStore';

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

const emit = defineEmits(['save', 'cancel', 'delete']);
const authStore = useAuthStore();

const isAmbassador = computed(() => {
    return authStore.user?.role?.name === 'Ambassador';
});

// Determine fields to use: props.fields takes precedence, otherwise load from schema
const activeFields = computed(() => {
    if (props.modelClass) {
        let fields = getFormFields(props.modelClass);
        // Filter out author if not ambassador
        if (!isAmbassador.value) {
            fields = fields.filter(f => f.key !== 'author');
        }
        return fields;
    }
    return [];
});


const formData = ref<any>({});
const formIsValid = ref(false);
const showDeleteConfirm = ref(false);

const isEditing = computed(() => {
    return props.initialData && (props.initialData as any).documentId;
});

const canDelete = computed(() => {
    if (!isEditing.value) return false;
    if (isAmbassador.value) return true;

    // Check ownership
    const author = props.initialData?.author;
    if (author) {
        if (author.documentId && author.documentId === authStore.user?.documentId) return true;
        if (author.id && author.id === authStore.user?.id) return true;
    }

    return false;
});

// Watch for changes in initialData to update formData
watch(() => props.initialData, (newData) => {
    if (newData) {
        // Clone the data to avoid mutating the prop directly
        formData.value = JSON.parse(JSON.stringify(newData));
    }
}, { immediate: true, deep: true });

function handleSubmit() {
    if (isEditing.value) {
        const diff: any = {};
        Object.keys(formData.value).forEach(key => {
            const initialValue = props.initialData[key];
            const currentValue = formData.value[key];

            // Simple comparison using JSON.stringify to handle arrays and primitives
            if (JSON.stringify(initialValue) !== JSON.stringify(currentValue)) {
                diff[key] = currentValue;
            }
        });
        emit('save', diff);
    } else {
        emit('save', formData.value);
    }
}

function confirmDelete() {
    showDeleteConfirm.value = false;
    emit('delete', formData.value);
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
