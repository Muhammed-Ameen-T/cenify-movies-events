// import React, { useEffect } from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider, useSelector } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { store, persistor, RootState } from './store/store';
// import { initializeAuth } from './store/initializeAuth';
// import App from './App.tsx';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import './index.css';
// import { Toaster } from 'react-hot-toast';
// import { initializeSocket } from './config/notification.config.ts';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       staleTime: 5 * 60 * 1000,
//     },
//     mutations: {
//       retry: 1,
//     },
//   },
// });

// const Root: React.FC = () => {
//   const user = useSelector((state: RootState) => state.auth.user);
//   const userId = user?.id || null;
//   const isAdmin = user?.role === 'admin' || false;
//   const isVendor = user?.role === 'vendor' || false;

//   useEffect(() => {
//     if (userId) {
//       const socket = initializeSocket(userId, isAdmin, isVendor);
//       return () => {
//         socket.disconnect();
//         console.log('Socket disconnected on cleanup');
//       };
//     }
//   }, [userId, isAdmin, isVendor]);

//   return (
//     <>
//       <App />
//       <Toaster />
//     </>
//   );
// };

// initializeAuth(store.dispatch).then(() => {
//   ReactDOM.createRoot(document.getElementById('root')!).render(
//     <React.StrictMode>
//       <QueryClientProvider client={queryClient}>
//         <Provider store={store}>
//           <PersistGate loading={null} persistor={persistor}>
//             <Root />
//           </PersistGate>
//         </Provider>
//       </QueryClientProvider>
//     </React.StrictMode>
//   );
// });

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { initializeAuth } from './store/initializeAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import Root from './Root.tsx';

// Create a single QueryClient instance to be shared across the app
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