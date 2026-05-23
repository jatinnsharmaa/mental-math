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
  it('calls POST /sessions/5/next with empty answers by default', async () => {
    mockOk({ questions: [] });
    await api.fetchNextBatch(5);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/5/next'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ answers: [] }) })
    );
  });

  it('passes buffered answers in body', async () => {
    mockOk({ questions: [] });
    const answers = [{ questionId: 1, userAnswer: '56', responseTimeMs: 400 }];
    await api.fetchNextBatch(5, answers);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/5/next'),
      expect.objectContaining({ body: JSON.stringify({ answers }) })
    );
  });
});

describe('api.endSession', () => {
  it('calls POST /sessions/1/end with empty answers by default', async () => {
    mockOk({ endedAt: '2024-01-01T00:00:00Z' });
    await api.endSession(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/1/end'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ answers: [] }) })
    );
  });

  it('passes remaining answers in body', async () => {
    mockOk({ endedAt: '2024-01-01T00:00:00Z' });
    const answers = [{ questionId: 3, userAnswer: 'yes', responseTimeMs: 200 }];
    await api.endSession(1, answers);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/1/end'),
      expect.objectContaining({ body: JSON.stringify({ answers }) })
    );
  });
});

describe('api.getMistakes', () => {
  it('calls GET /analytics/mistakes with days param', async () => {
    mockOk({ mistakes: [] });
    await api.getMistakes(30);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/analytics/mistakes?days=30'),
      expect.anything()
    );
  });

  it('includes category and difficulty filters when provided', async () => {
    mockOk({ mistakes: [] });
    await api.getMistakes(7, 'multiplication', 'hard');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('category=multiplication'),
      expect.anything()
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('difficulty=hard'),
      expect.anything()
    );
  });
});

describe('request error handling', () => {
  it('throws with error message from response body on non-ok status', async () => {
    mockError(401, { error: 'Unauthorized' });
    await expect(api.endSession(1)).rejects.toThrow('Unauthorized');
  });
});
