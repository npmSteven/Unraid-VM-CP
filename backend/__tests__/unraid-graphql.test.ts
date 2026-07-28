const mockAxios = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: mockAxios,
}));

jest.mock('../src/config.js', () => ({
  __esModule: true,
  config: {
    unraid: {
      baseUrl: 'http://test-unraid:80',
    },
  },
}));

import { initGraphQLClient, startVM, stopVM, forceStopVM, rebootVM, pauseVM, resumeVM, _resetForTests } from '../src/services/unraid-graphql.js';

const TEST_VM_ID = 'test-vm-uuid-123';

describe('unraid-graphql', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetForTests();
    initGraphQLClient(() => 'test-cookie');
  });

  const expectGraphQLCall = () => {
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://test-unraid:80/graphql',
        method: 'POST',
        headers: expect.objectContaining({ Cookie: 'test-cookie' }),
      }),
    );
  };

  describe('startVM', () => {
    it('returns true on success', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { data: { vm: { start: true } } },
      });
      const result = await startVM(TEST_VM_ID);
      expect(result).toBe(true);
      expectGraphQLCall();
    });

    it('throws on GraphQL error', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { errors: [{ message: 'VM not found' }] },
      });
      await expect(startVM(TEST_VM_ID)).rejects.toThrow('VM not found');
    });

    it('throws on network error', async () => {
      mockAxios.mockRejectedValueOnce(new Error('Network failure'));
      await expect(startVM(TEST_VM_ID)).rejects.toThrow('Network failure');
    });
  });

  describe('stopVM', () => {
    it('returns true on success', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { data: { vm: { stop: true } } },
      });
      const result = await stopVM(TEST_VM_ID);
      expect(result).toBe(true);
      expectGraphQLCall();
    });

    it('throws on GraphQL error', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { errors: [{ message: 'Cannot stop stopped VM' }] },
      });
      await expect(stopVM(TEST_VM_ID)).rejects.toThrow('Cannot stop stopped VM');
    });
  });

  describe('forceStopVM', () => {
    it('returns true on success', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { data: { vm: { forceStop: true } } },
      });
      const result = await forceStopVM(TEST_VM_ID);
      expect(result).toBe(true);
      expectGraphQLCall();
    });

    it('throws on GraphQL error', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { errors: [{ message: 'Force stop failed' }] },
      });
      await expect(forceStopVM(TEST_VM_ID)).rejects.toThrow('Force stop failed');
    });
  });

  describe('rebootVM', () => {
    it('returns true on success', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { data: { vm: { reboot: true } } },
      });
      const result = await rebootVM(TEST_VM_ID);
      expect(result).toBe(true);
      expectGraphQLCall();
    });

    it('throws on GraphQL error', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { errors: [{ message: 'VM not running' }] },
      });
      await expect(rebootVM(TEST_VM_ID)).rejects.toThrow('VM not running');
    });
  });

  describe('pauseVM', () => {
    it('returns true on success', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { data: { vm: { pause: true } } },
      });
      const result = await pauseVM(TEST_VM_ID);
      expect(result).toBe(true);
      expectGraphQLCall();
    });

    it('throws on GraphQL error', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { errors: [{ message: 'VM not running' }] },
      });
      await expect(pauseVM(TEST_VM_ID)).rejects.toThrow('VM not running');
    });
  });

  describe('resumeVM', () => {
    it('returns true on success', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { data: { vm: { resume: true } } },
      });
      const result = await resumeVM(TEST_VM_ID);
      expect(result).toBe(true);
      expectGraphQLCall();
    });

    it('throws on GraphQL error', async () => {
      mockAxios.mockResolvedValueOnce({
        data: { errors: [{ message: 'VM not paused' }] },
      });
      await expect(resumeVM(TEST_VM_ID)).rejects.toThrow('VM not paused');
    });
  });

  describe('uninitialized client', () => {
    it('throws when client not initialized', async () => {
      _resetForTests();
      await expect(startVM(TEST_VM_ID)).rejects.toThrow('GraphQL client not initialized');
    });
  });

  describe('no cookie', () => {
    it('throws when cookie getter returns empty', async () => {
      _resetForTests();
      initGraphQLClient(() => '');
      await expect(startVM(TEST_VM_ID)).rejects.toThrow('Not authenticated with Unraid');
    });
  });
});
