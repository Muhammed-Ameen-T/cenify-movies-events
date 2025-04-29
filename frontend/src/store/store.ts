import { configureStore } from '@reduxjs/toolkit';

import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import authReducer from './slices/authSlice';

import loadingReducer from './slices/loadingSlice';


const authPersistConfig = {

    key: 'auth',

    storage,

    version: 1,

};


const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);


export const store = configureStore({

    reducer: {

        auth: persistedAuthReducer,

        loading: loadingReducer,

    },

    middleware: (getDefaultMiddleware) =>

        getDefaultMiddleware({

            serializableCheck: {

                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],

            },

        }),

});


export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);


