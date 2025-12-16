import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import strapi from '@/services/strapi'

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

  it('canEdit returns true if user profile is author (by documentId)', () => {
    const authStore = useAuthStore()
    authStore.user = { 
        role: { name: 'Authenticated' }, 
        documentId: 'user1', 
        id: 1,
        profile: { documentId: 'profile1', id: 10 } 
    } as any
    authStore.token = 'token'

    const item = { author: { documentId: 'profile1' } }
    expect(authStore.canEdit(item)).toBe(true)
  })

  it('canEdit returns true if user profile is author (by id)', () => {
    const authStore = useAuthStore()
    authStore.user = { 
        role: { name: 'Authenticated' }, 
        documentId: 'user1', 
        id: 1,
        profile: { documentId: 'profile1', id: 10 }
    } as any
    authStore.token = 'token'

    const item = { author: { id: 10 } }
    expect(authStore.canEdit(item)).toBe(true)
  })

  it('canEdit returns false if user profile is not author', () => {
    const authStore = useAuthStore()
    authStore.user = { 
        role: { name: 'Authenticated' }, 
        documentId: 'user1', 
        id: 1,
        profile: { documentId: 'profile1', id: 10 }
    } as any
    authStore.token = 'token'

    const item = { author: { documentId: 'profile2', id: 20 } }
    expect(authStore.canEdit(item)).toBe(false)
  })
  
  it('canEdit returns false if user has no profile', () => {
    const authStore = useAuthStore()
    authStore.user = { 
        role: { name: 'Authenticated' }, 
        documentId: 'user1', 
        id: 1,
        // No profile
    } as any
    authStore.token = 'token'

    const item = { author: { documentId: 'profile1', id: 10 } }
    expect(authStore.canEdit(item)).toBe(false)
  })
  
  it('canDelete behaves same as canEdit', () => {
      const authStore = useAuthStore()
      authStore.user = { role: { name: 'Administrateur' }, documentId: 'user1', id: 1 } as any
      authStore.token = 'token'
  
      expect(authStore.canDelete({})).toBe(true)
  })

  it('login fetches full user profile including role', async () => {
    const authStore = useAuthStore()
    
    // Mock login response (often lacks role)
    const loginResponse = {
        jwt: 'test-token',
        user: { 
            id: 1, 
            username: 'admin', 
            email: 'admin@test.com' 
            // NO ROLE here
        }
    }
    vi.mocked(strapi.login).mockResolvedValue(loginResponse)

    // Mock getMe response (has role)
    const meResponse = {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        role: { name: 'Administrateur' }
    }
    vi.mocked(strapi.getMe).mockResolvedValue(meResponse)
    
    // Mock find (profile) - return empty or irrelevant for this test
    vi.mocked(strapi.find).mockResolvedValue({ data: [] })
    vi.mocked(strapi.setToken).mockImplementation(() => {})

    await authStore.login('admin', 'password')

    // Verify getMe was called
    expect(strapi.getMe).toHaveBeenCalled()
    
    // Verify user has role from getMe
    expect(authStore.user?.role?.name).toBe('Administrateur')
  })
})
