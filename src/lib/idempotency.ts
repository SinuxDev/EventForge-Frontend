import { ApiClientError } from '@/lib/api-client';

const RETRY_DELAY_MS = 700;

const randomToken = (): string => {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createIdempotencyKey = (operation: string): string => {
  const normalizedOperation = operation.trim().replace(/\s+/g, '-').toLowerCase();
  return `${normalizedOperation}:${randomToken()}`;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const runWithIdempotencyRetry = async <T>(
  operation: string,
  request: (idempotencyKey: string) => Promise<T>
): Promise<T> => {
  let key = createIdempotencyKey(operation);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await request(key);
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        throw error;
      }

      if (error.status === 409 && attempt === 0) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      if (error.status === 422 && attempt === 0) {
        key = createIdempotencyKey(operation);
        continue;
      }

      throw error;
    }
  }

  throw new Error('Idempotent request failed after retries');
};
