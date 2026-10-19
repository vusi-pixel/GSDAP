import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './lib/i18n';
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        const status = (error as any)?.response?.status ?? (error as any)?.status;
        if (status && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

// Apply stored theme on load
const stored = localStorage.getItem('omc-theme');
try {
  const parsed = stored ? JSON.parse(stored) : null;
  if (parsed?.state?.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
