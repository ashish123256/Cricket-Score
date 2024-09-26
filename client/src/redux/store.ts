// store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import scoreboardReducer from './scoreboardSlice'; // Import the new reducer


const rootReducer = combineReducers({
   
    scoreboard: scoreboardReducer, 
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;