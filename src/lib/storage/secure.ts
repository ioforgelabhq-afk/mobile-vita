/**
 * Secure key/secret access. In production this wraps expo-secure-store (DB encryption key,
 * tokens). For tests/MVP a volatile in-memory fallback is used when secure-store is absent.
 * Privacy by design (Principle VII): secrets never touch plain storage.
 */
export interface SecureStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

const mem = new Map<string, string>();

/** Volatile fallback (tests / web preview). Native build injects the expo-secure-store impl. */
export const memorySecureStore: SecureStore = {
  async getItem(key) {
    return mem.get(key) ?? null;
  },
  async setItem(key, value) {
    mem.set(key, value);
  },
  async deleteItem(key) {
    mem.delete(key);
  },
};
