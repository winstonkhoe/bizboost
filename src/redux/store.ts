import {configureStore} from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';
import searchReducer from './slices/searchSlice';
import userReducer from './slices/userSlice';
// ...

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    search: searchReducer,
    user: userReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {modal: ModalState}
export type AppDispatch = typeof store.dispatch;
