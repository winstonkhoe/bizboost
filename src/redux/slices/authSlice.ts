import {createSlice} from '@reduxjs/toolkit';

interface AuthState {
  isAccessGranted: boolean;
}

const initialState = {
  isAccessGranted: false,
} as AuthState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    allowAccess(state) {
      state.isAccessGranted = true;
    },
    disableAccess(state) {
      state.isAccessGranted = false;
    },
  },
});

export const {allowAccess, disableAccess} = authSlice.actions;
export default authSlice.reducer;
