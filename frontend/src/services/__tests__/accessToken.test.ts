import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockJwtDecode = vi.fn();

vi.mock('jwt-decode', () => ({
  jwtDecode: (...args: unknown[]) => mockJwtDecode(...args),
}));

import { saveAccessToken, getAccessToken, removeAccessToken, isAccessTokenValid } from '../accessToken';

describe('accessToken', () => {
  beforeEach(() => {
    localStorage.clear();
    mockJwtDecode.mockReset();
  });

  describe('saveAccessToken', () => {
    it('saves a token to localStorage', () => {
      saveAccessToken('test-token-123');
      expect(localStorage.getItem('access_token')).toBe('test-token-123');
    });
  });

  describe('getAccessToken', () => {
    it('returns null when no token is saved', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('returns the saved token', () => {
      localStorage.setItem('access_token', 'saved-token');
      expect(getAccessToken()).toBe('saved-token');
    });
  });

  describe('removeAccessToken', () => {
    it('removes the token from localStorage', () => {
      localStorage.setItem('access_token', 'token-to-remove');
      removeAccessToken();
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('isAccessTokenValid', () => {
    it('returns false when no token exists', () => {
      expect(isAccessTokenValid()).toBe(false);
    });

    it('returns false for malformed tokens', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      localStorage.setItem('access_token', 'not-a-jwt');
      expect(isAccessTokenValid()).toBe(false);
    });

    it('returns true for valid non-expired tokens', () => {
      mockJwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 3600 });
      localStorage.setItem('access_token', 'valid.jwt.token');
      expect(isAccessTokenValid()).toBe(true);
    });

    it('returns false for expired tokens', () => {
      mockJwtDecode.mockReturnValue({ exp: 0 });
      localStorage.setItem('access_token', 'expired.jwt.token');
      expect(isAccessTokenValid()).toBe(false);
    });
  });
});
