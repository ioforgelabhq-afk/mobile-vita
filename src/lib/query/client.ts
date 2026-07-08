import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client. All async/server-state flows through repositories via query/mutation
 * hooks — never raw fetch in screens. Generous staleness suits offline-first: cached reads stay
 * usable without connectivity (a persister is added with the encrypted store in a native build).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
