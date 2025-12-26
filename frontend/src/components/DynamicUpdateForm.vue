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

                <!-- Select / Autocomplete -->
                <v-select v-if="field.type === 'select' && !field.remote" v-model="formData[field.key]"
                    :label="field.required ? field.label + ' *' : field.label"
                    :items="field.optionsKey ? dataSources[field.optionsKey] : field.options"
                    :item-title="field.itemTitle || 'title'" :item-value="field.itemValue || 'documentId'"
                    :multiple="field.multiple" :chips="field.multiple" :clearable="!field.required" variant="outlined"
                    :rules="field.required ? [v => (field.multiple ? v && v.length > 0 : !!v) || 'Field is required'] : []"
                    density="comfortable"></v-select>

                <v-autocomplete v-if="field.type === 'select' && field.remote" v-model="formData[field.key]"
                    :label="field.required ? field.label + ' *' : field.label" :items="remoteOptions[field.key] || []"
                    :loading="remoteLoading[field.key]" :item-title="field.itemTitle || 'title'"
                    :item-value="field.itemValue || 'documentId'" :multiple="field.multiple" :chips="field.multiple"
                    :clearable="!field.required" variant="outlined" density="comfortable" no-filter
                    @update:search="(val) => onSearch(field, val)"
                    :rules="field.required ? [v => (field.multiple ? v && v.length > 0 : !!v) || 'Field is required'] : []">
                    <template v-slot:append-item>
                        <div v-if="canLoadMore(field.key)" v-intersect="() => loadMore(field)" class="pa-2 text-center">
                            <v-progress-circular indeterminate size="20" color="primary"></v-progress-circular>
                        </div>
                    </template>
                </v-autocomplete>

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
import { ref, watch, computed, type PropType, onMounted } from 'vue';
import { getFormFields } from '@/decorators/form';
import type { FieldDefinition } from '@/types/form';
import { useAuthStore } from '@/stores/authStore';
import * as strapiStores from '@/stores/strapiStore';

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

const remoteOptions = ref<Record<string, any[]>>({});
const initialOptions = ref<Record<string, any[]>>({});
const remoteLoading = ref<Record<string, boolean>>({});
const remotePages = ref<Record<string, number>>({});
const remoteTotalPages = ref<Record<string, number>>({});
const remoteSearchQueries = ref<Record<string, string>>({});

const storeMap: Record<string, any> = {
    events: strapiStores.useEventsStore,
    pois: strapiStores.usePoisStore,
    profiles: strapiStores.useProfilesStore,
    activities: strapiStores.useActivitiesStore,
    users: strapiStores.useUsersStore,
};

function getStore(storeKey: string) {
    const storeHook = storeMap[storeKey];
    return storeHook ? storeHook() : null;
}

const debounceTimers: Record<string, any> = {};

async function fetchRemoteOptions(field: FieldDefinition, page = 1, search = '') {
    if (!field.storeKey) return;
    const store = getStore(field.storeKey);
    if (!store) return;

    remoteLoading.value[field.key] = true;
    try {
        const response = await store.getList({
            page,
            pageSize: 20,
            search: typeof search === 'string' ? search : '',
            searchField: field.itemTitle || 'title',
            updateStore: false,
        });

        const items = response.data || [];

        if (page === 1) {
            // When resetting (page 1), we keep initialOptions to ensure pre-selected labels don't flicker/disappear
            const initial = initialOptions.value[field.key] || [];
            const itemValueKey = field.itemValue || 'documentId';

            // Merge results with initial options, avoiding duplicates
            const combined = [...initial];
            items.forEach((newItem: any) => {
                const exists = combined.find(opt => opt[itemValueKey] === newItem[itemValueKey]);
                if (!exists) combined.push(newItem);
            });

            remoteOptions.value[field.key] = combined;
        } else {
            const current = remoteOptions.value[field.key] || [];
            const itemValueKey = field.itemValue || 'documentId';
            const newItems = items.filter((newItem: any) => !current.find(opt => opt[itemValueKey] === newItem[itemValueKey]));
            remoteOptions.value[field.key] = [...current, ...newItems];
        }

        remotePages.value[field.key] = page;
        remoteTotalPages.value[field.key] = response.meta?.pagination?.pageCount || 1;
    } finally {
        remoteLoading.value[field.key] = false;
    }
}

function onSearch(field: FieldDefinition, query: any) {
    // Autocomplete search can be null or even the selected object sometimes
    const q = typeof query === 'string' ? query : '';
    if (debounceTimers[field.key]) clearTimeout(debounceTimers[field.key]);
    remoteSearchQueries.value[field.key] = q;
    debounceTimers[field.key] = setTimeout(() => {
        fetchRemoteOptions(field, 1, q);
    }, 300);
}

function canLoadMore(fieldKey: string) {
    return (remotePages.value[fieldKey] || 0) < (remoteTotalPages.value[fieldKey] || 0) && !remoteLoading.value[fieldKey];
}

function loadMore(field: FieldDefinition) {
    if (canLoadMore(field.key)) {
        fetchRemoteOptions(field, (remotePages.value[field.key] || 1) + 1, remoteSearchQueries.value[field.key]);
    }
}

onMounted(() => {
    activeFields.value.forEach(field => {
        if (field.remote && field.storeKey) {
            fetchRemoteOptions(field, 1);
        }
    });
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

        // For remote fields, if we have full objects in initialData, 
        // add them to remoteOptions so they can be rendered correctly (label instead of ID)
        activeFields.value.forEach(field => {
            if (field.remote && newData[field.key]) {
                const value = newData[field.key];
                const key = field.key;
                const itemValueKey = field.itemValue || 'documentId';

                if (!initialOptions.value[key]) initialOptions.value[key] = [];
                if (!remoteOptions.value[key]) remoteOptions.value[key] = [];

                const addOption = (item: any) => {
                    if (item && typeof item === 'object' && item[itemValueKey]) {
                        const exists = initialOptions.value[key].find(opt => opt[itemValueKey] === item[itemValueKey]);
                        if (!exists) {
                            initialOptions.value[key] = [...initialOptions.value[key], JSON.parse(JSON.stringify(item))];
                        }
                        // Also add to remoteOptions if not there
                        const existsRemote = remoteOptions.value[key].find(opt => opt[itemValueKey] === item[itemValueKey]);
                        if (!existsRemote) {
                            remoteOptions.value[key] = [...remoteOptions.value[key], JSON.parse(JSON.stringify(item))];
                        }
                        return item[itemValueKey];
                    }
                    return item;
                };

                if (Array.isArray(value)) {
                    formData.value[key] = value.map(addOption);
                } else {
                    formData.value[key] = addOption(value);
                }
            }
        });
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
