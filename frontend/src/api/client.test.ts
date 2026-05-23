import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock authStore before importing client
vi.mock('../stores/authStore', () => ({
  useAuthStore: { getState: () => ({ token: 'test-token' }) },
}));

// Must import AFTER mock setup
const { api } = await import('./client');

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

function mockError(status: number, body: { error: string }) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve(body),
    statusText: 'Error',
  });
}

beforeEach(() => mockFetch.mockReset());

describe('api.startSession', () => {
  it('calls POST /sessions with correct body', async () => {
    mockOk({ sessionId: 1, questions: [] });
    await api.startSession(['multiplication'], ['easy']);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ categories: ['multiplication'], difficulties: ['easy'] }) })
    );
  });
});

describe('api.fetchNextBatch', () => {
  it('calls GET /sessions/5/next', async () => {
    mockOk({ questions: [] });
    await api.fetchNextBatch(5);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/sessions/5/next'), expect.anything());
  });
});

describe('api.submitAnswer', () => {
  it('calls POST /sessions/1/answers with correct body', async () => {
    mockOk({ isCorrect: true, correctAnswer: '56' });
    await api.submitAnswer(1, 2, 'yes', 300);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/1/answers'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ questionId: 2, userAnswer: 'yes', responseTimeMs: 300 }) })
    );
  });
});

describe('api.endSession', () => {
  it('calls POST /sessions/1/end', async () => {
    mockOk({ endedAt: '2024-01-01T00:00:00Z' });
    await api.endSession(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/sessions/1/end'), expect.objectContaining({ method: 'POST' }));
  });
});

describe('request error handling', () => {
  it('throws with error message from response body on non-ok status', async () => {
    mockError(401, { error: 'Unauthorized' });
    await expect(api.endSession(1)).rejects.toThrow('Unauthorized');
  });
});
