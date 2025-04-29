import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store,persistor } from './store/store';
import { initializeAuth } from './store/initializeAuth';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed queries once
      staleTime: 5 * 60 * 1000, // Cache queries for 5 minutes
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

store.dispatch((dispatch) => {
  initializeAuth(dispatch).then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </React.StrictMode>
    );
  });
});