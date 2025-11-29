import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DynamicUpdateForm from '@/components/DynamicUpdateForm.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import { FormField } from '@/decorators/form'

const vuetify = createVuetify({
  components,
  directives,
})

// Mock auth store
const mockAuthStore = {
  user: null as any,
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Test Model
class TestModel {
  @FormField({ label: 'Name', type: 'text', required: true })
  name: string = '';

  @FormField({ label: 'Age', type: 'number' })
  age: number = 0;
}

describe('DynamicUpdateForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockAuthStore.user = null
  })

  it('renders fields based on model class', () => {
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData: {},
        modelClass: TestModel,
        title: 'Test Form',
      },
    })

    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Age')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
  })

  it('populates form with initial data', () => {
    const initialData = { name: 'John', age: 30 }
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData,
        modelClass: TestModel,
      },
    })

    const nameInput = wrapper.find('input[type="text"]').element as HTMLInputElement
    const ageInput = wrapper.find('input[type="number"]').element as HTMLInputElement

    expect(nameInput.value).toBe('John')
    expect(ageInput.value).toBe('30')
  })

  it('emits save with form data on submit (create mode)', async () => {
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData: {},
        modelClass: TestModel,
      },
    })

    await wrapper.find('input[type="text"]').setValue('Jane')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')![0][0]).toEqual({ name: 'Jane' })
  })

  it('emits save with diff on submit (edit mode)', async () => {
    const initialData = { documentId: '1', name: 'John', age: 30 }
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData,
        modelClass: TestModel,
      },
    })

    await wrapper.find('input[type="text"]').setValue('Jane')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')![0][0]).toEqual({ name: 'Jane' })
  })

  it('shows delete button for ambassador', () => {
    mockAuthStore.user = { role: { name: 'Ambassador' } }
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData: { documentId: '1' },
        modelClass: TestModel,
      },
    })

    expect(wrapper.text()).toContain('Delete')
  })

  it('hides delete button for non-owner', () => {
    mockAuthStore.user = { documentId: 'user2', role: { name: 'Authenticated' } }
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData: { documentId: '1', author: { documentId: 'user1' } },
        modelClass: TestModel,
      },
    })

    expect(wrapper.text()).not.toContain('Delete')
  })

  it('shows delete button for owner', () => {
    mockAuthStore.user = { documentId: 'user1', role: { name: 'Authenticated' } }
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData: { documentId: '1', author: { documentId: 'user1' } },
        modelClass: TestModel,
      },
    })

    expect(wrapper.text()).toContain('Delete')
  })
})
