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

  @FormField({ label: 'Event Date', type: 'datetime' })
  date: string = '';
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
    expect(wrapper.find('input[type="datetime-local"]').exists()).toBe(true)
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

  it('adds asterisk to required field label', () => {
        const wrapper = mount(DynamicUpdateForm, {
            global: {
                plugins: [vuetify],
            },
            props: {
                modelClass: TestModel,
                initialData: {},
            },
        });

        // TestModel.name is required
        expect(wrapper.html()).toContain('Name *'); 
        // TestModel.age is optional
        expect(wrapper.html()).toContain('Age');
        expect(wrapper.html()).not.toContain('Age *');
  });

  it('validates required fields', async () => {
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData: {},
        modelClass: TestModel,
      },
    })

    const nameInput = wrapper.findAllComponents(components.VTextField).find(c => c.props('label') === 'Name *')
    const ageInput = wrapper.findAllComponents(components.VTextField).find(c => c.props('label') === 'Age')

    expect(nameInput).toBeDefined()
    expect(ageInput).toBeDefined()

    expect(nameInput!.props('rules')).toHaveLength(1)
    expect(ageInput!.props('rules')).toHaveLength(0)

    const rule = nameInput!.props('rules')[0] as (v: any) => string | boolean
    expect(rule('')).toBe('Field is required')
    expect(rule('value')).toBe(true)
  })
  it('disables save button when form is invalid', async () => {
    const wrapper = mount(DynamicUpdateForm, {
      global: {
        plugins: [vuetify],
      },
      props: {
        initialData: {},
        modelClass: TestModel,
      },
    })

    const saveBtn = wrapper.findAllComponents(components.VBtn).find(b => b.text() === 'Save')
    expect(saveBtn).toBeDefined()
    
    // Initially empty required field (Name), so should be disabled
    // note: v-form validation happens async usually, but initial state might be valid until touched or validated
    // However, with v-model, it reflects current state.
    
    // Let's trigger validation or input
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('')
    await wrapper.find('form').trigger('submit') // Trigger validation
    
    // Since we are relying on Vuetify internal validation logic which might not fully run in JSDOM/happy-dom without proper setup
    // We might check if the binding exists. 
    // But let's try to verify the disabled attribute usage based on the ref we added.

    // Better approach for unit testing this integration:
    // Check if the button has the disabled prop bound to the formIsValid state.
    // We can simulate the form updating the model.
    
    const form = wrapper.findComponent(components.VForm)
    await form.vm.$emit('update:modelValue', false)
    expect(saveBtn!.attributes('disabled')).toBeDefined() // should be disabled
    
    await form.vm.$emit('update:modelValue', true)
    expect(saveBtn!.attributes('disabled')).toBeUndefined() // should be enabled
  })
})
