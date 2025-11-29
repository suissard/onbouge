import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { strapiStoreBuilder } from '@/stores/strapiStore'

// Mock the strapi service
const mockStrapi = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('@/services/strapi', () => ({
  default: mockStrapi,
}))

interface MockItem {
  documentId: string
  name: string
}

describe('strapiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const useTestStore = strapiStoreBuilder<MockItem>('testItems')

  it('initializes with empty data', () => {
    const store = useTestStore()
    expect(store.datas).toEqual([])
  })

  it('getList fetches data and populates store', async () => {
    const store = useTestStore()
    const mockData = [{ documentId: '1', name: 'Item 1' }]
    mockStrapi.find.mockResolvedValue({ data: mockData })

    await store.getList()

    expect(mockStrapi.find).toHaveBeenCalledWith('testItems', { populate: '*' })
    expect(store.datas).toEqual(mockData)
  })

  it('get fetches single item and updates store (new item)', async () => {
    const store = useTestStore()
    const mockItem = { documentId: '1', name: 'Item 1' }
    mockStrapi.findOne.mockResolvedValue({ data: mockItem })

    const result = await store.get('1')

    expect(mockStrapi.findOne).toHaveBeenCalledWith('testItems', '1', { populate: '*' })
    expect(store.datas).toContainEqual(mockItem)
    expect(result).toEqual(mockItem)
  })

  it('get fetches single item and updates store (existing item)', async () => {
    const store = useTestStore()
    const initialItem = { documentId: '1', name: 'Old Name' }
    store.datas = [initialItem]
    
    const updatedItem = { documentId: '1', name: 'New Name' }
    mockStrapi.findOne.mockResolvedValue({ data: updatedItem })

    const result = await store.get('1')

    expect(store.datas).toHaveLength(1)
    expect(store.datas[0]).toEqual(updatedItem)
    expect(result).toEqual(updatedItem)
  })

  it('create adds new item to store', async () => {
    const store = useTestStore()
    const newItem = { name: 'New Item' }
    const createdItem = { documentId: '1', ...newItem }
    mockStrapi.create.mockResolvedValue({ data: createdItem })

    const result = await store.create(newItem)

    expect(mockStrapi.create).toHaveBeenCalledWith('testItems', newItem)
    expect(store.datas).toContainEqual(createdItem)
    expect(result).toEqual(createdItem)
  })

  it('update modifies existing item in store', async () => {
    const store = useTestStore()
    const initialItem = { documentId: '1', name: 'Old Name' }
    store.datas = [initialItem]

    const updateData = { name: 'New Name' }
    const updatedItem = { documentId: '1', ...updateData }
    mockStrapi.update.mockResolvedValue({ data: updatedItem })

    await store.update('1', updateData)

    expect(mockStrapi.update).toHaveBeenCalledWith('testItems', '1', updateData)
    expect(store.datas[0]).toEqual(updatedItem)
  })

  it('delete removes item from store', async () => {
    const store = useTestStore()
    const itemToDelete = { documentId: '1', name: 'Item 1' }
    store.datas = [itemToDelete]
    mockStrapi.delete.mockResolvedValue({})

    await store.delete('1')

    expect(mockStrapi.delete).toHaveBeenCalledWith('testItems', '1')
    expect(store.datas).toEqual([])
  })
})
