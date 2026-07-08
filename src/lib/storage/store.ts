/**
 * Local persistence abstraction.
 *
 * Repositories talk to a CollectionStore, never to a concrete engine. The MVP ships an
 * in-memory store (used by mocks + tests). The production swap is an encrypted expo-sqlite
 * store whose key lives in expo-secure-store (Principle VII) — same interface, zero repo
 * changes. See docs/domain/domain-model.md "Persistence strategy".
 */
export interface CollectionStore<T extends { id: string }> {
  get(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  put(item: T): Promise<T>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function memoryStore<T extends { id: string }>(): CollectionStore<T> {
  const map = new Map<string, T>();
  return {
    async get(id) {
      return map.get(id) ?? null;
    },
    async list() {
      return Array.from(map.values());
    },
    async put(item) {
      map.set(item.id, item);
      return item;
    },
    async remove(id) {
      map.delete(id);
    },
    async clear() {
      map.clear();
    },
  };
}
