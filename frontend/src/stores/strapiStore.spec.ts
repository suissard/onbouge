import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePoisStore, useEventsStore } from '@/stores/strapiStore'
import strapi from '@/services/strapi'

// Mock strapi service
vi.mock('@/services/strapi', () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  }
}))

describe('Strapi Store (Generic)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('getList fetches and updates datas', async () => {
    const store = useEventsStore()
    const mockData = [{ documentId: '1', title: 'Event 1' }]
    vi.mocked(strapi.find).mockResolvedValue({ data: mockData, meta: { total: 1 } })

    await store.getList()

    expect(strapi.find).toHaveBeenCalledWith('events', expect.any(Object))
    expect(store.datas).toEqual(mockData)
    expect(store.meta).toEqual({ total: 1 })
  })

  it('get fetches and updates/adds a single item', async () => {
    const store = useEventsStore()
    const mockItem = { documentId: '1', title: 'Event 1 Updated' }
    vi.mocked(strapi.findOne).mockResolvedValue({ data: mockItem })

    const result = await store.get('1')

    expect(strapi.findOne).toHaveBeenCalledWith('events', '1', expect.any(Object))
    expect(result).toEqual(mockItem)
    expect(store.datas).toContainEqual(mockItem)
  })

  it('create adds a new item to datas', async () => {
    const store = useEventsStore()
    const newItem = { title: 'New Event' }
    const createdItem = { documentId: '2', ...newItem }
    vi.mocked(strapi.create).mockResolvedValue({ data: createdItem })

    await store.create(newItem)

    expect(strapi.create).toHaveBeenCalledWith('events', newItem)
    expect(store.datas).toContainEqual(createdItem)
  })

  it('update modifies an existing item in datas', async () => {
    const store = useEventsStore()
    store.datas = [{ documentId: '1', title: 'Old Title' }] as any
    const updatedItem = { documentId: '1', title: 'New Title' }
    vi.mocked(strapi.update).mockResolvedValue({ data: updatedItem })

    await store.update('1', { title: 'New Title' })

    expect(strapi.update).toHaveBeenCalledWith('events', '1', { title: 'New Title' })
    expect(store.datas[0].title).toBe('New Title')
  })

  it('delete removes an item from datas', async () => {
    const store = useEventsStore()
    store.datas = [{ documentId: '1', title: 'Event 1' }] as any
    vi.mocked(strapi.delete).mockResolvedValue({})

    await store.delete('1')

    expect(strapi.delete).toHaveBeenCalledWith('events', '1')
    expect(store.datas).toHaveLength(0)
  })
})

describe('Pois Store (Spatial Search)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('spatialSearch calls the correct endpoint and updates datas', async () => {
    const store = usePoisStore()
    const mockPois = [
      { documentId: 'p1', title: 'POI 1', distance: 500 },
      { documentId: 'p2', title: 'POI 2', distance: 1500 }
    ]
    vi.mocked(strapi.request).mockResolvedValue(mockPois)

    const lat = 48.85
    const lng = 2.35
    const radius = 10

    const result = await store.spatialSearch(lat, lng, radius)

    expect(strapi.request).toHaveBeenCalledWith(
      'GET',
      expect.stringContaining(`/pois/spatial-search?lat=${lat}&lng=${lng}&distance=${radius}`)
    )
    expect(result).toEqual(mockPois)
    expect(store.datas).toEqual(mockPois)
  })

  it('spatialSearch handles errors', async () => {
    const store = usePoisStore()
    const errorMessage = 'API Error'
    vi.mocked(strapi.request).mockRejectedValue(new Error(errorMessage))

    await expect(store.spatialSearch(0, 0, 10)).rejects.toThrow(errorMessage)
  })
})
