import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEventsStore } from '../events';
import strapi from '@/strapi';

// Mock the strapi client
vi.mock('@/strapi', () => {
  return {
    default: {
      get: vi.fn(),
    }
  };
});

describe('Events Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchEvents success', async () => {
    const eventsStore = useEventsStore();
    const mockResponse = {
      data: [
        { id: 1, attributes: { title: 'Event 1', description: 'Desc 1' } },
        { id: 2, attributes: { title: 'Event 2', description: 'Desc 2' } },
      ]
    };
    strapi.get.mockResolvedValue(mockResponse);

    await eventsStore.fetchEvents();

    expect(strapi.get).toHaveBeenCalledWith('events');
    expect(eventsStore.events.length).toBe(2);
    expect(eventsStore.events[0].attributes.title).toBe('Event 1');
    expect(eventsStore.isLoading).toBe(false);
    expect(eventsStore.error).toBe(null);
  });

  it('fetchEvents failure', async () => {
    const eventsStore = useEventsStore();
    strapi.get.mockRejectedValue(new Error('API Error'));

    await eventsStore.fetchEvents();

    expect(strapi.get).toHaveBeenCalledWith('events');
    expect(eventsStore.events.length).toBe(0);
    expect(eventsStore.isLoading).toBe(false);
    expect(eventsStore.error).toBe('Failed to fetch events.');
  });
});
