import { configureStore } from '@reduxjs/toolkit';

import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';

import locationReducer from './slices/locationSlice';

import loadingReducer from './slices/loadingSlice';

import popupNotificationReducer from './slices/notificationSlice';

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

        location: locationReducer,

        popupNotification: popupNotificationReducer,

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