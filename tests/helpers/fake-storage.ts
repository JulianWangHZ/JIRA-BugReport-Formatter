import type { KeyValueStorage } from '../../src/shared/settings-store.js';

export interface FakeStorage extends KeyValueStorage {
  readonly data: Record<string, unknown>;
  failNextSet(message: string): void;
}

/** In-memory stand-in for `chrome.storage.sync`. */
export function createFakeStorage(initial: Record<string, unknown> = {}): FakeStorage {
  const data: Record<string, unknown> = { ...initial };
  let pendingFailure: string | undefined;

  return {
    data,
    failNextSet(message) {
      pendingFailure = message;
    },
    async get(keys) {
      return Object.fromEntries(keys.filter(key => key in data).map(key => [key, data[key]]));
    },
    async set(items) {
      if (pendingFailure !== undefined) {
        const message = pendingFailure;
        pendingFailure = undefined;
        throw new Error(message);
      }
      Object.assign(data, items);
    }
  };
}
