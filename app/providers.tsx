'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from '@/lib/theme-context';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry on 401 (auth failures)
          if (error?.response?.status === 401) {
            return false;
          }
          // Retry other errors up to 3 times
          return failureCount < 3;
        },
      },
    },
  }));

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

