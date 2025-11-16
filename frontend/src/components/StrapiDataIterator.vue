<template>
  <div>
    <v-toolbar flat class="mb-4">
      <v-text-field
        v-model="search"
        label="Rechercher"
        clearable
        prepend-inner-icon="mdi-magnify"
        variant="solo"
        hide-details
        class="me-4"
      ></v-text-field>
      <v-btn
        v-if="creationRoute"
        :to="creationRoute"
        icon="mdi-plus"
        color="primary"
        variant="tonal"
      ></v-btn>
    </v-toolbar>

    <div v-if="loading">
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card" height="200"></v-skeleton-loader>
        </v-col>
      </v-row>
    </div>

    <v-data-iterator
      v-else
      :items="store.datas"
      :items-per-page="itemsPerPage"
      :page="page"
      :search="search"
      @update:page="page = $event"
      @update:items-per-page="itemsPerPage = $event"
    >
      <template v-slot:default="{ items }">
        <v-row>
          <v-col v-for="item in items" :key="(item.raw as any).id" cols="12" sm="6" md="4" lg="3">
            <component :is="itemComponent" v-bind="componentPropsMapper(item.raw)" />
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
        <div class="d-flex align-center justify-space-between pa-4">
          <div style="min-width: 150px;">
            <span class="text-caption me-2">Éléments par page:</span>
            <v-select
              v-model="itemsPerPage"
              :items="[10, 20, 50]"
              density="compact"
              variant="outlined"
              hide-details
              class="d-inline-block"
              style="max-width: 80px;"
            ></v-select>
          </div>

          <div class="d-flex align-center">
            <v-btn
              :disabled="page === 1"
              icon="mdi-arrow-left"
              density="comfortable"
              rounded
              variant="tonal"
              class="me-2"
              @click="prevPage"
            ></v-btn>

            <div class="mx-2 text-caption">
              Page {{ page }} sur {{ pageCount }}
            </div>

            <v-btn
              :disabled="page >= pageCount"
              icon="mdi-arrow-right"
              density="comfortable"
              rounded
              variant="tonal"
              class="ms-2"
              @click="nextPage"
            ></v-btn>
          </div>
        </div>
      </template>

      <template v-slot:no-data>
        <v-alert type="warning" class="mt-4">
          Aucun résultat trouvé.
        </v-alert>
      </template>

    </v-data-iterator>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, type Component } from 'vue';

const props = defineProps({
  store: {
    type: Object,
    required: true
  },
  itemComponent: {
    type: Object as () => Component,
    required: true
  },
  creationRoute: {
    type: String,
    default: ''
  },
  componentPropsMapper: {
    type: Function,
    required: true
  }
});

const search = ref('');
const loading = ref(true);
const page = ref(1);
const itemsPerPage = ref(10);

onMounted(async () => {
  console.log('StrapiDataIterator mounted');
  loading.value = true;
  await props.store.getList();
  loading.value = false;
});
</script>
