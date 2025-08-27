import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { initializeAuth } from './store/initializeAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import Root from './Root.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

initializeAuth(store.dispatch).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Root queryClient={queryClient} />
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
});