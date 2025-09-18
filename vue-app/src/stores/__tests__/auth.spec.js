import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';
import strapi from '@/strapi';

// Mock the strapi client
vi.mock('@/strapi', () => {
  return {
    default: {
      login: vi.fn(),
      register: vi.fn(),
      setAuth: vi.fn(),
      removeAuth: vi.fn(),
      get: vi.fn(),
    }
  };
});

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('login success', async () => {
    const authStore = useAuthStore();
    const mockResponse = { jwt: 'fake-jwt', user: { id: 1, username: 'testuser' } };
    strapi.login.mockResolvedValue(mockResponse);

    const result = await authStore.login('testuser', 'password');

    expect(strapi.login).toHaveBeenCalledWith('testuser', 'password');
    expect(authStore.jwt).toBe('fake-jwt');
    expect(authStore.user.username).toBe('testuser');
    expect(localStorage.getItem('jwt')).toBe('fake-jwt');
    expect(strapi.setAuth).toHaveBeenCalledWith('fake-jwt');
    expect(result.success).toBe(true);
  });

  it('logout', () => {
    // First, simulate a logged-in state
    localStorage.setItem('jwt', 'fake-jwt');
    const authStore = useAuthStore();
    authStore.jwt = 'fake-jwt';
    authStore.user = { id: 1, username: 'testuser' };

    authStore.logout();

    expect(authStore.jwt).toBe(null);
    expect(authStore.user).toBe(null);
    expect(localStorage.getItem('jwt')).toBe(null);
    expect(strapi.removeAuth).toHaveBeenCalled();
  });

  it('register success', async () => {
    const authStore = useAuthStore();
    const mockResponse = { jwt: 'new-jwt', user: { id: 2, username: 'newuser' } };
    strapi.register.mockResolvedValue(mockResponse);

    const result = await authStore.register('newuser', 'new@test.com', 'password');

    expect(strapi.register).toHaveBeenCalledWith({ username: 'newuser', email: 'new@test.com', password: 'password' });
    expect(authStore.jwt).toBe('new-jwt');
    expect(authStore.user.username).toBe('newuser');
    expect(localStorage.getItem('jwt')).toBe('new-jwt');
    expect(strapi.setAuth).toHaveBeenCalledWith('new-jwt');
    expect(result.success).toBe(true);
  });
});
