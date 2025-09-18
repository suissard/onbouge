import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HomeView from '../HomeView.vue';

describe('HomeView', () => {
  it('renders a welcome message', () => {
    const wrapper = mount(HomeView);
    expect(wrapper.text()).toContain('Bienvenue sur la version Vue.js de SportConnect!');
  });
});
