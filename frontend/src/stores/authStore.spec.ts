import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

// Mock strapi service
vi.mock('@/services/strapi', () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    setToken: vi.fn(),
    getMe: vi.fn(),
    login: vi.fn(),
    signOut: vi.fn(),
    register: vi.fn(),
  }
}))

describe('authStore Permissions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('canEdit returns false if not authenticated', () => {
    const authStore = useAuthStore()
    // authStore.user is null by default
    
    expect(authStore.canEdit({})).toBe(false)
  })

  it('canEdit returns true for Ambassador role', () => {
    const authStore = useAuthStore()
    authStore.user = { role: { name: 'Ambassador' }, documentId: 'user1', id: 1 } as any
    authStore.token = 'token'

    expect(authStore.canEdit({})).toBe(true)
  })

  it('canEdit returns true for Administrateur role', () => {
    const authStore = useAuthStore()
    authStore.user = { role: { name: 'Administrateur' }, documentId: 'user1', id: 1 } as any
    authStore.token = 'token'

    expect(authStore.canEdit({})).toBe(true)
  })

  it('canEdit returns true if user is author (by documentId)', () => {
    const authStore = useAuthStore()
    authStore.user = { role: { name: 'Authenticated' }, documentId: 'user1', id: 1 } as any
    authStore.token = 'token'

    const item = { author: { documentId: 'user1' } }
    expect(authStore.canEdit(item)).toBe(true)
  })

  it('canEdit returns true if user is author (by id)', () => {
    const authStore = useAuthStore()
    authStore.user = { role: { name: 'Authenticated' }, documentId: 'user1', id: 1 } as any
    authStore.token = 'token'

    const item = { author: { id: 1 } }
    expect(authStore.canEdit(item)).toBe(true)
  })

  it('canEdit returns false if user is not author and not admin/ambassador', () => {
    const authStore = useAuthStore()
    authStore.user = { role: { name: 'Authenticated' }, documentId: 'user1', id: 1 } as any
    authStore.token = 'token'

    const item = { author: { documentId: 'user2', id: 2 } }
    expect(authStore.canEdit(item)).toBe(false)
  })
  
  it('canDelete behaves same as canEdit', () => {
      const authStore = useAuthStore()
      authStore.user = { role: { name: 'Administrateur' }, documentId: 'user1', id: 1 } as any
      authStore.token = 'token'
  
      expect(authStore.canDelete({})).toBe(true)
  })
})
