import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GenericCard from '@/components/GenericCard.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('GenericCard', () => {
  it('renders title and description', () => {
    const wrapper = mount(GenericCard, {
      global: {
        plugins: [vuetify],
      },
      props: {
        title: 'Test Title',
        description: 'Test Description',
        route: '/test-route',
      },
    })

    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test Description')
  })

  it('truncates long description', () => {
    const longDescription = 'a'.repeat(150)
    const wrapper = mount(GenericCard, {
      global: {
        plugins: [vuetify],
      },
      props: {
        title: 'Test Title',
        description: longDescription,
        route: '/test-route',
      },
    })

    expect(wrapper.text()).toContain('...')
    expect(wrapper.text().length).toBeLessThan(longDescription.length)
  })

  it('navigates on click', async () => {
    const wrapper = mount(GenericCard, {
      global: {
        plugins: [vuetify],
      },
      props: {
        title: 'Test Title',
        description: 'Test Description',
        route: '/test-route',
      },
    })

    await wrapper.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/test-route')
  })
})
