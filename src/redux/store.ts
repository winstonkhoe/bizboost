import {configureStore} from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';
import searchReducer from './slices/searchSlice';
import userReducer from './slices/userSlice';
import campaignReducer from './slices/campaignSlice';
import categoryReducer from './slices/categorySlice';
import chatReducer from './slices/chatSlice';
import authReducer from './slices/authSlice';
import portfolioReducer from './slices/portfolioSlice';
import createAdditionalAccountReducer from './slices/forms/createAdditionalAccountSlice';
import signupReducer from './slices/forms/signup';

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    search: searchReducer,
    user: userReducer,
    campaign: campaignReducer,
    createAdditionalAccount: createAdditionalAccountReducer,
    signup: signupReducer,
    chat: chatReducer,
    category: categoryReducer,
    portfolio: portfolioReducer,
    auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {modal: ModalState}
export type AppDispatch = typeof store.dispatch;
